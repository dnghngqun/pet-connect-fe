/**
 * Convert binary data to base64 string
 */
export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  let bytes: Uint8Array;

  if (binary instanceof ArrayBuffer) {
    bytes = new Uint8Array(binary);
  } else {
    bytes = binary;
  }

  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }

  return btoa(binaryString);
}

/**
 * Convert base64 to data URL for image display
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generate QR code data URL from binary response
 */
export function generateQRDataUrl(binaryData: ArrayBuffer | Uint8Array): string {
  const base64 = binaryToBase64(binaryData);
  return base64ToDataUrl(base64);
}

