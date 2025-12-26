/**
 * Mock QR code URLs for testing
 * Dùng URL trực tiếp đến QR code image
 */

// QR code mẫu từ Wikipedia
export const MOCK_QR_CODE_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

/**
 * Lấy mock QR code URL
 */
export function getMockQRCodeUrl(petId?: string): string {
  return MOCK_QR_CODE_URL;
}


