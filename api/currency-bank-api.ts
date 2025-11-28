/**
 * Currency Bank API Service
 * Handles all currency bank account management operations for MASTER_NODE
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Types
export interface BankAccount {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
}

export interface CurrencyBankAccount {
  id: string;
  currency: string;
  currencyName: string;
  currencySymbol: string;
  bankAccounts: BankAccount[];
  qrCodeUrl: string;
  qrCodeProvider: string;
  instructions: string;
  isActive: boolean;
  priority: number;
  minAmount: string;
  maxAmount: string;
  countryCode: string;
  processingTime: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateCurrencyBankPayload {
  currency: string;
  currencyName: string;
  currencySymbol: string;
  bankAccounts: BankAccount[];
  qrCodeUrl?: string;
  qrCodeProvider?: string;
  instructions: string;
  minAmount: number;
  maxAmount: number;
  countryCode: string;
  processingTime: string;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateCurrencyBankPayload {
  bankAccounts?: BankAccount[];
  instructions?: string;
  processingTime?: string;
  qrCodeProvider?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  priority?: number;
}

export interface CurrencyBankPublicData {
  currency: string;
  currencyName: string;
  currencySymbol: string;
  bankAccounts: BankAccount[];
  qrCodeUrl: string;
  qrCodeProvider: string;
  instructions: string;
  minAmount: string;
  maxAmount: string;
  processingTime: string;
}

export interface QRCodeUploadResponse {
  qrCodeUrl: string;
  currency: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Helper function to get auth headers
function getAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a new currency bank account
 * @param token - Authentication token
 * @param payload - Currency bank account data
 * @returns Promise with created currency bank account
 */
export async function createCurrencyBank(
  token: string,
  payload: CreateCurrencyBankPayload
): Promise<ApiResponse<CurrencyBankAccount>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to create currency bank account',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating currency bank account:', error);
    return {
      success: false,
      message: 'Network error while creating currency bank account',
    };
  }
}

/**
 * Get all currency bank accounts
 * @param token - Authentication token
 * @returns Promise with list of all currency bank accounts
 */
export async function getAllCurrencyBanks(
  token: string
): Promise<ApiResponse<CurrencyBankAccount[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to fetch currency bank accounts',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching currency bank accounts:', error);
    return {
      success: false,
      message: 'Network error while fetching currency bank accounts',
    };
  }
}

/**
 * Get specific currency bank account by currency code
 * @param token - Authentication token
 * @param currency - Currency code (e.g., 'INR', 'JPY')
 * @returns Promise with currency bank account details
 */
export async function getCurrencyBankByCurrency(
  token: string,
  currency: string
): Promise<ApiResponse<CurrencyBankPublicData>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank/${currency}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to fetch currency bank account',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching currency bank account:', error);
    return {
      success: false,
      message: 'Network error while fetching currency bank account',
    };
  }
}

/**
 * Update currency bank account
 * @param token - Authentication token
 * @param currency - Currency code (e.g., 'INR', 'JPY')
 * @param payload - Updated currency bank account data
 * @returns Promise with updated currency bank account
 */
export async function updateCurrencyBank(
  token: string,
  currency: string,
  payload: UpdateCurrencyBankPayload
): Promise<ApiResponse<CurrencyBankAccount>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank/${currency}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to update currency bank account',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating currency bank account:', error);
    return {
      success: false,
      message: 'Network error while updating currency bank account',
    };
  }
}

/**
 * Upload QR code for currency bank account
 * @param token - Authentication token
 * @param currency - Currency code (e.g., 'INR', 'JPY')
 * @param qrCodeFile - QR code image file
 * @returns Promise with uploaded QR code URL
 */
export async function uploadQRCode(
  token: string,
  currency: string,
  qrCodeFile: File
): Promise<ApiResponse<QRCodeUploadResponse>> {
  try {
    const formData = new FormData();
    formData.append('qrCode', qrCodeFile);

    const response = await fetch(`${BASE_URL}/api/v1/currency-bank/${currency}/upload-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to upload QR code',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return {
      success: false,
      message: 'Network error while uploading QR code',
    };
  }
}

/**
 * Deactivate currency bank account (soft delete)
 * @param token - Authentication token
 * @param currency - Currency code (e.g., 'INR', 'JPY')
 * @returns Promise with success status
 */
export async function deactivateCurrencyBank(
  token: string,
  currency: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank/${currency}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to deactivate currency bank account',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error deactivating currency bank account:', error);
    return {
      success: false,
      message: 'Network error while deactivating currency bank account',
    };
  }
}

/**
 * Permanently delete currency bank account
 * @param token - Authentication token
 * @param currency - Currency code (e.g., 'INR', 'JPY')
 * @returns Promise with success status
 */
export async function permanentlyDeleteCurrencyBank(
  token: string,
  currency: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/currency-bank/${currency}/permanent`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to permanently delete currency bank account',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error permanently deleting currency bank account:', error);
    return {
      success: false,
      message: 'Network error while permanently deleting currency bank account',
    };
  }
}
