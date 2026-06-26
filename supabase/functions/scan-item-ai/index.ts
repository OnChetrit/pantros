import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.103.0';

type ScanMode = 'barcode' | 'expiration';

type RequestBody = {
  mode?: unknown;
  imageBase64?: unknown;
  mimeType?: unknown;
};

type OpenAiMessage = {
  role: 'system' | 'user';
  content: string | Record<string, unknown>[];
};

type OpenAiResponse = {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
  error?: {
    message?: string;
  };
};

type RateLimitWindow = {
  label: string;
  since: string;
  limit: number;
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil((MAX_IMAGE_BYTES * 4) / 3);
const MAX_EVENTS_PER_HOUR = 30;
const MAX_EVENTS_PER_DAY = 120;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(status: number, code: string, message: string, retryable = false) {
  return jsonResponse(
    {
      error: {
        code,
        message,
        retryable,
      },
    },
    status
  );
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim() || null;
}

function isScanMode(value: unknown): value is ScanMode {
  return value === 'barcode' || value === 'expiration';
}

function isBase64(value: string) {
  return /^[A-Za-z0-9+/=]+$/.test(value);
}

function estimatedImageBytes(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function makePrompt(mode: ScanMode) {
  if (mode === 'barcode') {
    return {
      system: `You read product barcodes from package photos.
Return only valid JSON in this exact shape:
{"found": true, "barcode": "7290012345678", "original": "7290012345678"}
or
{"found": false, "barcode": null, "original": null}

Rules:
- Return only the best barcode candidate from the image.
- Prefer 8-14 digit barcode values.
- Remove spaces or separators.
- Do not guess if the digits are unclear.
- Do not include any explanation outside the JSON object.`,
      user: 'Extract the barcode digits from this product image.',
    };
  }

  return {
    system: `You read expiration dates from product images.
Return only valid JSON in this exact shape:
{"found": true, "date": "YYYY-MM-DD", "original": "matched text"}
or
{"found": false, "date": null, "original": null}

Rules:
- Extract best before / use by / exp / expiry style dates.
- Convert the detected date to YYYY-MM-DD.
- If only month and year exist, use the last day of that month.
- If the year is 2 digits, assume 20XX.
- Do not include any explanation outside the JSON object.`,
    user: 'Extract the expiration date from this product image.',
  };
}

async function enforceRateLimit(
  admin: ReturnType<typeof createClient>,
  userId: string,
  mode: ScanMode,
  requestBytes: number
) {
  const now = new Date();
  const windows: RateLimitWindow[] = [
    {
      label: 'hour',
      since: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      limit: MAX_EVENTS_PER_HOUR,
    },
    {
      label: 'day',
      since: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      limit: MAX_EVENTS_PER_DAY,
    },
  ];

  for (const window of windows) {
    const {count, error} = await admin
      .schema('private')
      .from('ai_scan_events')
      .select('*', {count: 'exact', head: true})
      .eq('user_id', userId)
      .gte('created_at', window.since);

    if (error) {
      console.error('Failed to check AI scan usage', {
        userId,
        mode,
        window: window.label,
        error: error.message,
      });
      return errorResponse(500, 'rate_limit_check_failed', 'AI scanning is unavailable right now.', true);
    }

    if ((count ?? 0) >= window.limit) {
      return errorResponse(429, 'rate_limited', 'You have reached the AI scan limit. Please try again later.', true);
    }
  }

  const {error: insertError} = await admin.schema('private').from('ai_scan_events').insert({
    user_id: userId,
    mode,
    request_bytes: requestBytes,
  });

  if (insertError) {
    console.error('Failed to record AI scan usage', {
      userId,
      mode,
      error: insertError.message,
    });
    return errorResponse(500, 'rate_limit_write_failed', 'AI scanning is unavailable right now.', true);
  }

  return null;
}

function normalizeBarcodeResult(parsed: Record<string, unknown>) {
  const barcode = typeof parsed.barcode === 'string' ? parsed.barcode.replace(/\D/g, '') : '';

  if (parsed.found === true && /^\d{8,14}$/.test(barcode)) {
    return jsonResponse({
      success: true,
      mode: 'barcode',
      barcode,
      originalText: typeof parsed.original === 'string' ? parsed.original : barcode,
    });
  }

  return errorResponse(422, 'barcode_not_found', 'No barcode digits were detected in the selected image.', false);
}

function normalizeExpirationResult(parsed: Record<string, unknown>) {
  if (parsed.found === true && typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
    return jsonResponse({
      success: true,
      mode: 'expiration',
      date: parsed.date,
      originalText: typeof parsed.original === 'string' ? parsed.original : null,
    });
  }

  return errorResponse(422, 'date_not_found', 'No expiration date was detected in the selected image.', false);
}

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Method not allowed');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  const accessToken = getBearerToken(request);

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !openAiApiKey) {
    console.error('Required function secrets are unavailable');
    return errorResponse(500, 'server_configuration_incomplete', 'Server configuration is incomplete');
  }

  if (!accessToken) {
    return errorResponse(401, 'authentication_required', 'Authentication is required');
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return errorResponse(400, 'invalid_json', 'A valid JSON body is required');
  }

  if (!isScanMode(body.mode) || typeof body.imageBase64 !== 'string' || typeof body.mimeType !== 'string') {
    return errorResponse(400, 'invalid_request', 'The AI scan request is invalid');
  }

  if (!SUPPORTED_MIME_TYPES.has(body.mimeType)) {
    return errorResponse(415, 'unsupported_image_type', 'Only JPEG and PNG images are supported.');
  }

  if (body.imageBase64.length === 0 || body.imageBase64.length > MAX_BASE64_LENGTH || !isBase64(body.imageBase64)) {
    return errorResponse(
      413,
      'image_too_large',
      'The selected image is too large or invalid. Use a JPEG or PNG under 5 MB.'
    );
  }

  const requestBytes = estimatedImageBytes(body.imageBase64);

  if (requestBytes <= 0 || requestBytes > MAX_IMAGE_BYTES) {
    return errorResponse(
      413,
      'image_too_large',
      'The selected image is too large or invalid. Use a JPEG or PNG under 5 MB.'
    );
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: {user},
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user) {
    return errorResponse(401, 'invalid_session', 'Your session is no longer valid');
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rateLimitFailure = await enforceRateLimit(admin, user.id, body.mode, requestBytes);

  if (rateLimitFailure) {
    return rateLimitFailure;
  }

  const prompt = makePrompt(body.mode);
  const messages: OpenAiMessage[] = [
    {
      role: 'system',
      content: prompt.system,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt.user,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${body.mimeType};base64,${body.imageBase64}`,
            detail: 'high',
          },
        },
      ],
    },
  ];

  let openAiResponse: Response;

  try {
    openAiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 150,
        temperature: 0,
      }),
    });
  } catch {
    return errorResponse(502, 'upstream_unreachable', 'The AI scan service is temporarily unavailable.', true);
  }

  const payload = (await openAiResponse.json().catch(() => ({}))) as OpenAiResponse;

  if (!openAiResponse.ok) {
    return errorResponse(
      502,
      'upstream_request_failed',
      payload.error?.message ?? 'The AI scan service could not process the image.',
      true
    );
  }

  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return errorResponse(502, 'empty_upstream_response', 'The AI scan service returned an empty response.', true);
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    return errorResponse(502, 'invalid_upstream_response', 'The AI scan service returned an invalid response.', true);
  }

  return body.mode === 'barcode' ? normalizeBarcodeResult(parsed) : normalizeExpirationResult(parsed);
});
