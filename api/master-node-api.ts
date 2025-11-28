import { ApiResponse, PaginatedResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DashboardStats {
  pending: number;
  processing: number;
  completed: number;
  rejected: number;
  totalCompleted: number;
  totalUsdtCredited: string;
  todayRequests: number;
  todayUsdtCredited: string;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referralCode: string;
  status: string;
}

export interface BankAccount {
  upiId?: string;
  branch?: string;
  bankName?: string;
  ifscCode?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface BankDetails {
  currency: string;
  maxAmount: string;
  minAmount: string;
  qrCodeUrl?: string;
  bankAccounts: BankAccount[];
  currencyName: string;
  instructions?: string;
  currencySymbol: string;
  processingTime?: string;
  qrCodeProvider?: string;
}

export interface AddMoneyRequest {
  id: string;
  userId: string;
  currency: string;
  currencyAmount: string;
  usdtAmount: string;
  exchangeRate: string;
  exchangeRateSource: string;
  rateTimestamp: string;
  amount: string;
  bonusAmount: string;
  totalAmount: string;
  bankDetailsProvided: BankDetails | null;
  bankDetailsSentAt: string | null;
  bankDetailsSentBy: string | null;
  method: string;
  status: string;
  paymentDetails: Record<string, any>;
  masterNodeId: string | null;
  processedAt: string | null;
  verifiedAt: string | null;
  paymentProof: string | null;
  screenshotUploadedAt: string | null;
  screenshotVerifiedAt: string | null;
  transactionRef: string | null;
  userNotes: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserInfo;
}

export interface RequestFilters {
  page?: number;
  limit?: number;
  status?: string;
  currency?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VerifyRequestPayload {
  adminNotes: string;
}

export interface RejectRequestPayload {
  rejectionReason: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build query string from filters
 */
function buildQueryString(filters: RequestFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get authorization headers with token
 */
function getAuthHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get dashboard statistics
 * @param token - Authentication token
 * @returns Promise with dashboard stats
 */
export async function getDashboardStats(
  token: string
): Promise<ApiResponse<DashboardStats>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/god-admin/stats`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to fetch dashboard stats",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      message: "Network error while fetching dashboard stats",
    };
  }
}

/**
 * Get all requests with filters
 * @param token - Authentication token
 * @param filters - Optional filters for requests
 * @returns Promise with paginated requests
 */
export async function getAllRequests(
  token: string,
  filters: RequestFilters = {}
): Promise<ApiResponse<PaginatedResponse<AddMoneyRequest>>> {
  try {
    const queryString = buildQueryString(filters);
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/requests${queryString}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to fetch requests",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching requests:", error);
    return {
      success: false,
      message: "Network error while fetching requests",
    };
  }
}

/**
 * Get pending requests only
 * @param token - Authentication token
 * @param filters - Optional filters (page, limit, currency)
 * @returns Promise with paginated pending requests
 */
export async function getPendingRequests(
  token: string,
  filters: Omit<RequestFilters, 'status'> = {}
): Promise<ApiResponse<PaginatedResponse<AddMoneyRequest>>> {
  try {
    const queryString = buildQueryString(filters);
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/pending${queryString}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to fetch pending requests",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return {
      success: false,
      message: "Network error while fetching pending requests",
    };
  }
}

/**
 * Get request by ID (full details)
 * @param token - Authentication token
 * @param requestId - Request ID
 * @returns Promise with request details
 */
export async function getRequestById(
  token: string,
  requestId: string
): Promise<ApiResponse<AddMoneyRequest>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/requests/${requestId}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to fetch request details",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching request details:", error);
    return {
      success: false,
      message: "Network error while fetching request details",
    };
  }
}

/**
 * Send bank details to user
 * @param token - Authentication token
 * @param requestId - Request ID
 * @returns Promise with updated request
 */
export async function sendBankDetails(
  token: string,
  requestId: string
): Promise<ApiResponse<AddMoneyRequest>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/requests/${requestId}/send-bank-details`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to send bank details",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending bank details:", error);
    return {
      success: false,
      message: "Network error while sending bank details",
    };
  }
}

/**
 * Verify screenshot and credit USDT (accept request)
 * @param token - Authentication token
 * @param requestId - Request ID
 * @param payload - Admin notes
 * @returns Promise with updated request
 */
export async function verifyRequest(
  token: string,
  requestId: string,
  payload: VerifyRequestPayload
): Promise<ApiResponse<AddMoneyRequest>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/requests/${requestId}/verify`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to verify request",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying request:", error);
    return {
      success: false,
      message: "Network error while verifying request",
    };
  }
}

/**
 * Reject request
 * @param token - Authentication token
 * @param requestId - Request ID
 * @param payload - Rejection reason
 * @returns Promise with updated request
 */
export async function rejectRequest(
  token: string,
  requestId: string,
  payload: RejectRequestPayload
): Promise<ApiResponse<AddMoneyRequest>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/requests/${requestId}/reject`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to reject request",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      success: false,
      message: "Network error while rejecting request",
    };
  }
}
