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
          brand: {
            type: 'string',
            description:
              "The brand, if identifiable from the item text (e.g. 'AMUL BUTTER 500G' -> brand 'Amul', name 'Butter 500G'). Empty string if no brand is discernible — do not guess a brand that isn't implied by the text."
          },
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
- Prices matter most — look carefully at the price column for every line, even on
  faint, low-contrast, or partially cropped receipts. A line item without a price is
  much less useful than one without a brand.
- If only one of "unit price" or "line total" is legible for an item, compute the
  other one yourself from quantity (unitPrice = totalPrice / quantity, or
  totalPrice = unitPrice * quantity). Only use 0 for a price if there is truly no
  price visible anywhere on that line and it cannot be derived.
- If a non-price field isn't visible or legible, use your best reasonable estimate
  rather than leaving it blank; never invent items that aren't on the receipt.
- "unit" should be a short shopping unit like kg, g, L, ml, pcs, or pack.
- If the item text on the receipt includes a recognizable brand (e.g. "AMUL
  BUTTER 500G", "TATA SALT 1KG"), split it into brand ("Amul", "Tata") and a
  clean product name ("Butter 500G", "Salt 1kg"). If no brand is discernible
  from the text, leave brand as an empty string — do not invent one.
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
        ? parsed.items.map((i: any) => {
            const quantity = Number(i.quantity) || 1;
            let unitPrice = Number(i.unitPrice) || 0;
            let totalPrice = Number(i.totalPrice) || 0;
            // Defensive cross-fill: if the model only populated one of the two
            // price fields, derive the other instead of silently leaving a 0.
            if (unitPrice === 0 && totalPrice > 0) unitPrice = totalPrice / quantity;
            if (totalPrice === 0 && unitPrice > 0) totalPrice = unitPrice * quantity;
            return {
              name: i.name || 'Unknown Item',
              brand: i.brand || '',
              quantity,
              unit: i.unit || 'pcs',
              unitPrice,
              totalPrice
            };
          })
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
