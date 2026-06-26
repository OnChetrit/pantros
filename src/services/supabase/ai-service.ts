import { supabase } from './client';

export type AiScanMode = 'barcode' | 'expiration';

type FunctionSuccessPayload =
  | {
      success: true;
      mode: 'barcode';
      barcode: string;
      originalText: string | null;
    }
  | {
      success: true;
      mode: 'expiration';
      date: string;
      originalText: string | null;
    };

type FunctionErrorPayload = {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type AiScanError = {
  code: string;
  message: string;
  retryable: boolean;
};

export type BarcodeScanResult = {
  success: boolean;
  barcode: string | null;
  originalText: string | null;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
};

export type ExpirationScanResult = {
  success: boolean;
  date: string | null;
  originalText: string | null;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
};

const FUNCTION_NAME = 'scan-item-ai';

function inferMimeType(imageUri: string) {
  const normalized = imageUri.toLowerCase();

  if (normalized.includes('.png')) {
    return 'image/png';
  }

  return 'image/jpeg';
}

async function imageToBase64(imageUri: string): Promise<string> {
  const response = await fetch(imageUri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function toFunctionError(error: unknown): AiScanError {
  if (error && typeof error === 'object') {
    const payload = error as {
      context?: FunctionErrorPayload;
      message?: string;
      name?: string;
    };

    if (payload.context?.error) {
      return payload.context.error;
    }

    if (typeof payload.message === 'string' && payload.message.length > 0) {
      return {
        code: payload.name ?? 'scan_failed',
        message: payload.message,
        retryable: true,
      };
    }
  }

  return {
    code: 'scan_failed',
    message: 'AI scanning is unavailable right now.',
    retryable: true,
  };
}

async function invokeAiScan(mode: AiScanMode, imageUri: string) {
  const base64Image = await imageToBase64(imageUri);
  const mimeType = inferMimeType(imageUri);

  const { data, error } = await supabase.functions.invoke<FunctionSuccessPayload>(FUNCTION_NAME, {
    body: {
      mode,
      imageBase64: base64Image,
      mimeType,
    },
  });

  if (error) {
    throw toFunctionError(error);
  }

  return data;
}

export async function extractBarcodeValue(imageUri: string): Promise<BarcodeScanResult> {
  try {
    const data = await invokeAiScan('barcode', imageUri);

    if (data?.success && data.mode === 'barcode' && /^\d{8,14}$/.test(data.barcode)) {
      return {
        success: true,
        barcode: data.barcode,
        originalText: data.originalText,
      };
    }

    return {
      success: false,
      barcode: null,
      originalText: null,
      error: 'No barcode digits were detected in the selected image.',
      errorCode: 'barcode_not_found',
      retryable: false,
    };
  } catch (error) {
    const resolved = toFunctionError(error);
    return {
      success: false,
      barcode: null,
      originalText: null,
      error: resolved.message,
      errorCode: resolved.code,
      retryable: resolved.retryable,
    };
  }
}

export async function extractExpirationDate(imageUri: string): Promise<ExpirationScanResult> {
  try {
    const data = await invokeAiScan('expiration', imageUri);

    if (data?.success && data.mode === 'expiration' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return {
        success: true,
        date: data.date,
        originalText: data.originalText,
      };
    }

    return {
      success: false,
      date: null,
      originalText: null,
      error: 'No expiration date was detected in the selected image.',
      errorCode: 'date_not_found',
      retryable: false,
    };
  } catch (error) {
    const resolved = toFunctionError(error);
    return {
      success: false,
      date: null,
      originalText: null,
      error: resolved.message,
      errorCode: resolved.code,
      retryable: resolved.retryable,
    };
  }
}
