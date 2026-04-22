export type ExpirationScanResult = {
  success: boolean;
  date: string | null;
  originalText: string | null;
  error?: string;
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

export async function extractExpirationDate(
  imageUri: string,
  apiKey: string
): Promise<ExpirationScanResult> {
  try {
    const base64Image = await imageToBase64(imageUri);
    const imageType = imageUri.toLowerCase().includes('.png') ? 'png' : 'jpeg';

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You read expiration dates from product images.
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
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract the expiration date from this product image.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageType};base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        date: null,
        originalText: null,
        error: errorData.error?.message ?? `OpenAI request failed (${response.status})`,
      };
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        success: false,
        date: null,
        originalText: null,
        error: 'No response returned from the AI scanner.',
      };
    }

    try {
      const parsed = JSON.parse(content);

      if (parsed.found && typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
        return {
          success: true,
          date: parsed.date,
          originalText: typeof parsed.original === 'string' ? parsed.original : null,
        };
      }

      return {
        success: false,
        date: null,
        originalText: typeof parsed.original === 'string' ? parsed.original : null,
        error: 'No expiration date was detected in the selected image.',
      };
    } catch {
      return {
        success: false,
        date: null,
        originalText: null,
        error: 'The AI response could not be parsed.',
      };
    }
  } catch (error) {
    return {
      success: false,
      date: null,
      originalText: null,
      error: error instanceof Error ? error.message : 'Image scan failed.',
    };
  }
}
