/**
 * Bank and Settings API Service
 * Handles all bank account management and profit rate operations for MASTER_NODE 
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Daily Profit Rate Types
export interface DailyProfitRate {
  id: string;
  date: string;
  bronzeRate: string;
  silverRate: string;
  goldRate: string;
  diamondRate: string;
  setBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isFallback: boolean;
}

export interface SetDailyRatePayload {
  date: string;
  bronzeRate: number;
  silverRate: number;
  goldRate: number;
  diamondRate: number;
  notes?: string;
}

export interface DailyRateStatus {
  isSetForToday: boolean;
  todayRate: DailyProfitRate | null;
  fallbackUsed: boolean;
}

// Bank Account Types
export interface BankAccount {
  id: string;
  accountName: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  qrCodeUrl: string | null;
  qrCodeProvider: string;
  instructions: string;
  accountType: string;
  isActive: boolean;
  isPrimary: boolean;
  displayOrder: number;
  minAmount: string;
  maxAmount: string;
  processingTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountPayload {
  accountName: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;
  qrCodeProvider?: string;
  instructions: string;
  accountType: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isActive?: boolean;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface UpdateBankAccountPayload {
  accountName?: string;
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  qrCodeProvider?: string;
  instructions?: string;
  accountType?: string;
  minAmount?: number;
  maxAmount?: number;
  processingTime?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface QRCodeUploadResponse {
  qrCodeUrl: string;
  accountId: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse JSON response, handling HTML error pages
 */
async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Failed to parse response as JSON:', text.substring(0, 200));
    throw new Error('Server returned an invalid response. Please check if the backend is running.');
  }
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ============================================
// DAILY PROFIT RATE API
// ============================================

/**
 * Set daily profit rate
 * @param token - Authentication token
 * @param payload - Daily rate data
 * @returns Promise with created/updated daily rate
 */
export async function setDailyProfitRate(
  token: string,
  payload: SetDailyRatePayload
): Promise<ApiResponse<DailyProfitRate>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/daily-rates`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to set daily profit rate',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error setting daily profit rate:', error);
    return {
      success: false,
      message: 'Network error while setting daily profit rate',
    };
  }
}

/**
 * Check if daily rate is set for today
 * @param token - Authentication token
 * @returns Promise with rate status
 */
export async function getDailyRateStatus(
  token: string
): Promise<ApiResponse<DailyRateStatus>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/daily-rates/status`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to check daily rate status',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error checking daily rate status:', error);
    return {
      success: false,
      message: 'Network error while checking daily rate status',
    };
  }
}

/**
 * Get today's rate (with auto-fallback)
 * @param token - Authentication token
 * @returns Promise with today's rate
 */
export async function getTodayRate(
  token: string
): Promise<ApiResponse<DailyProfitRate>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/admin/daily-rates/today`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to get today\'s rate',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error getting today\'s rate:', error);
    return {
      success: false,
      message: 'Network error while getting today\'s rate',
    };
  }
}

// ============================================
// BANK ACCOUNT API
// ============================================

/**
 * Get all bank accounts (Admin)
 * @param token - Authentication token
 * @returns Promise with list of all bank accounts
 */
export async function getAllBankAccounts(
  token: string
): Promise<ApiResponse<BankAccount[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts/admin`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to fetch bank accounts',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return {
      success: false,
      message: 'Network error while fetching bank accounts',
    };
  }
}

/**
 * Get bank account by ID (Admin)
 * @param token - Authentication token
 * @param accountId - Bank account ID
 * @returns Promise with bank account details
 */
export async function getBankAccountById(
  token: string,
  accountId: string
): Promise<ApiResponse<BankAccount>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts/admin/${accountId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to fetch bank account',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return {
      success: false,
      message: 'Network error while fetching bank account',
    };
  }
}

/**
 * Create a new bank account
 * @param token - Authentication token
 * @param payload - Bank account data
 * @returns Promise with created bank account
 */
export async function createBankAccount(
  token: string,
  payload: CreateBankAccountPayload
): Promise<ApiResponse<BankAccount>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to create bank account',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error creating bank account:', error);
    return {
      success: false,
      message: 'Network error while creating bank account',
    };
  }
}

/**
 * Update bank account
 * @param token - Authentication token
 * @param accountId - Bank account ID
 * @param payload - Updated bank account data
 * @returns Promise with updated bank account
 */
export async function updateBankAccount(
  token: string,
  accountId: string,
  payload: UpdateBankAccountPayload
): Promise<ApiResponse<BankAccount>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts/${accountId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to update bank account',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error updating bank account:', error);
    return {
      success: false,
      message: 'Network error while updating bank account',
    };
  }
}

/**
 * Upload QR code for bank account
 * @param token - Authentication token
 * @param accountId - Bank account ID
 * @param qrCodeFile - QR code image file
 * @returns Promise with uploaded QR code URL
 */
export async function uploadBankQRCode(
  token: string,
  accountId: string,
  qrCodeFile: File
): Promise<ApiResponse<QRCodeUploadResponse>> {
  try {
    const formData = new FormData();
    formData.append('qrCode', qrCodeFile);

    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts/${accountId}/upload-qr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to upload QR code',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return {
      success: false,
      message: 'Network error while uploading QR code',
    };
  }
}

/**
 * Deactivate bank account (soft delete)
 * @param token - Authentication token
 * @param accountId - Bank account ID
 * @returns Promise with success status
 */
export async function deactivateBankAccount(
  token: string,
  accountId: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/bank-accounts/${accountId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || 'Failed to deactivate bank account',
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error('Error deactivating bank account:', error);
    return {
      success: false,
      message: 'Network error while deactivating bank account',
    };
  }
}
