import { GoogleGenAI } from '@google/genai';

// Model used for receipt scanning. Uses Google's "-latest" alias so this
// automatically tracks their current stable Flash model instead of pointing
// at a specific version that gets retired over time (as gemini-2.5-flash was).
// FALLBACK_MODEL is tried if the alias isn't available on a given API key.
const RECEIPT_MODEL = 'gemini-flash-latest';
const FALLBACK_MODEL = 'gemini-3.6-flash';

export const getGeminiConfig = () => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const apiKey = metaEnv.VITE_GEMINI_API_KEY || '';
  return { apiKey, isConfigured: !!apiKey };
};

let clientInstance: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI | null => {
  const { apiKey, isConfigured } = getGeminiConfig();
  if (!isConfigured) return null;
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey });
  }
  return clientInstance;
};

export interface ScannedReceiptItem {
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ScannedReceipt {
  storeName: string;
  date: string; // YYYY-MM-DD, best guess
  items: ScannedReceiptItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
}

const RECEIPT_SCHEMA = {
  type: 'object',
  properties: {
    storeName: { type: 'string' },
    date: { type: 'string', description: 'Purchase date in YYYY-MM-DD format. Best guess if unclear.' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          brand: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string', description: "e.g. kg, g, L, ml, pcs, pack" },
          unitPrice: { type: 'number' },
          totalPrice: { type: 'number' }
        },
        required: ['name', 'quantity', 'unit', 'unitPrice', 'totalPrice']
      }
    },
    subtotal: { type: 'number' },
    discount: { type: 'number' },
    deliveryCharge: { type: 'number' },
    tax: { type: 'number' },
    grandTotal: { type: 'number' }
  },
  required: ['storeName', 'date', 'items', 'subtotal', 'discount', 'deliveryCharge', 'tax', 'grandTotal']
};

const PROMPT = `You are reading a photo of a grocery/shopping receipt or invoice.
Extract every purchased line item with its quantity, unit, unit price, and line total.
Also extract the store name, purchase date, and the totals section (subtotal, any
discount, delivery/service fee, tax, and grand total).

Rules:
- If a numeric field isn't visible or legible, use your best reasonable estimate
  rather than leaving it blank; never invent items that aren't on the receipt.
- "unit" should be a short shopping unit like kg, g, L, ml, pcs, or pack.
- If the receipt has no explicit brand for an item, use an empty string.
- date must be in YYYY-MM-DD format. If the year is missing, assume the current year.
- Respond with the extracted data only, matching the given schema exactly.`;

/**
 * Sends a receipt photo to Gemini and returns structured purchase data.
 * Returns null if Gemini isn't configured, the call fails, or the response
 * can't be parsed — callers should fall back to manual entry in that case.
 */
export const scanReceiptImage = async (
  base64Data: string,
  mimeType: string
): Promise<ScannedReceipt | null> => {
  const client = getClient();
  if (!client) return null;

  const contents = [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: PROMPT }
      ]
    }
  ];
  const config = {
    responseMimeType: 'application/json',
    responseSchema: RECEIPT_SCHEMA
  };

  let response;
  try {
    response = await client.models.generateContent({ model: RECEIPT_MODEL, contents, config });
  } catch (primaryErr) {
    console.warn(`Gemini model "${RECEIPT_MODEL}" failed, retrying with "${FALLBACK_MODEL}":`, primaryErr);
    try {
      response = await client.models.generateContent({ model: FALLBACK_MODEL, contents, config });
    } catch (fallbackErr) {
      console.error('Gemini receipt scan failed on both models:', fallbackErr);
      return null;
    }
  }

  try {
    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text);

    // Defensive normalization in case the model omits an optional-looking field.
    return {
      storeName: parsed.storeName || '',
      date: parsed.date || new Date().toISOString().slice(0, 10),
      items: Array.isArray(parsed.items)
        ? parsed.items.map((i: any) => ({
            name: i.name || 'Unknown Item',
            brand: i.brand || '',
            quantity: Number(i.quantity) || 1,
            unit: i.unit || 'pcs',
            unitPrice: Number(i.unitPrice) || 0,
            totalPrice: Number(i.totalPrice) || 0
          }))
        : [],
      subtotal: Number(parsed.subtotal) || 0,
      discount: Number(parsed.discount) || 0,
      deliveryCharge: Number(parsed.deliveryCharge) || 0,
      tax: Number(parsed.tax) || 0,
      grandTotal: Number(parsed.grandTotal) || 0
    };
  } catch (err) {
    console.error('Gemini receipt scan failed:', err);
    return null;
  }
};

/** Reads a File as a base64 string (without the data: URL prefix). */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:image/png;base64," prefix — Gemini wants raw base64.
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
