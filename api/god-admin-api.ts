/**
 * God Admin API Service
 * Handles commissions, withdrawals, and KYC management for MASTER_NODE
 */

import { ApiResponse, PaginatedResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ============================================
// TYPE DEFINITIONS
// ============================================

// Commission Queue Types
export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export interface CommissionQueueData {
  queue: string;
  metrics: QueueMetrics;
  timestamp: string;
}

// Withdrawal Types
export interface WithdrawalBankDetails {
  bankName: string;
  ifscCode: string;
  accountName: string;
  accountNumber: string;
}

export interface WithdrawalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referralCode: string;
  status: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  investmentId: string;
  amount: string;
  method: string;
  status: string;
  bankDetails: WithdrawalBankDetails | null;
  contactDetails: any;
  paymentProof: string | null;
  transactionRef: string | null;
  processedBy: string | null;
  processedAt: string | null;
  userNotes: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: WithdrawalUser;
}

export interface ProcessWithdrawalPayload {
  transactionRef: string;
  adminNotes: string;
}

export interface RejectWithdrawalPayload {
  rejectionReason: string;
}

// KYC Types
export interface KYCDocument {
  url: string;
  type: string;
  publicId: string;
  verified: boolean;
  uploadedAt: string;
}

export interface KYCPanDetails {
  image: KYCDocument;
  number: string;
}

export interface KYCAadhaarDetails {
  number: string;
  frontImage: KYCDocument;
  backImage: KYCDocument;
}

export interface KYCBankDetails {
  ifscCode: string;
  accountNumber: string;
  accountHolderName: string;
  proofImage: KYCDocument;
}

export interface KYCAddressProof {
  image: KYCDocument;
}

export interface KYCDocuments {
  pan: KYCPanDetails;
  selfie: KYCDocument;
  aadhaar: KYCAadhaarDetails;
  bankDetails: KYCBankDetails;
  addressProof: KYCAddressProof;
}

export interface KYCDetails {
  userId: string;
  status: string;
  documents: KYCDocuments;
  verifiedAt: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  canResubmit: boolean;
}

export interface PendingKYC {
  userId: string;
  userName: string;
  email: string;
  phone: string;
  referralCode: string;
  submittedAt: string;
  documentsCount: number;
  allDocumentsUploaded: boolean;
}

export interface KYCStats {
  total: number;
  notSubmitted: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  approvalRate: number;
  averageApprovalTime: number;
}

export interface DocumentIssue {
  documentType: string;
  issue: string;
}

export interface ReviewKYCPayload {
  userId: string;
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
  documentIssues?: DocumentIssue[];
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

function getAuthHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// ============================================
// COMMISSION QUEUE API
// ============================================

/**
 * Get commission queue metrics
 * @param token - Authentication token
 * @returns Promise with queue metrics
 */
export async function getCommissionQueueMetrics(
  token: string
): Promise<ApiResponse<CommissionQueueData>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/commissions/queue/metrics`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch commission queue metrics",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching commission queue metrics:", error);
    return {
      success: false,
      message: "Network error while fetching commission queue metrics",
    };
  }
}

// ============================================
// WITHDRAWAL API
// ============================================

/**
 * Get pending withdrawals
 * @param token - Authentication token
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with paginated withdrawals
 */
export async function getPendingWithdrawals(
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<Withdrawal[]> & { pagination?: any }> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/withdrawals/god-admin/pending?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch pending withdrawals",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    return {
      success: false,
      message: "Network error while fetching pending withdrawals",
    };
  }
}

/**
 * Process (accept) withdrawal request
 * @param token - Authentication token
 * @param withdrawalId - Withdrawal ID
 * @param payload - Transaction reference and admin notes
 * @returns Promise with updated withdrawal
 */
export async function processWithdrawal(
  token: string,
  withdrawalId: string,
  payload: ProcessWithdrawalPayload
): Promise<ApiResponse<Withdrawal>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/withdrawals/${withdrawalId}/process`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to process withdrawal",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return {
      success: false,
      message: "Network error while processing withdrawal",
    };
  }
}

/**
 * Reject withdrawal request
 * @param token - Authentication token
 * @param withdrawalId - Withdrawal ID
 * @param payload - Rejection reason
 * @returns Promise with updated withdrawal
 */
export async function rejectWithdrawal(
  token: string,
  withdrawalId: string,
  payload: RejectWithdrawalPayload
): Promise<ApiResponse<Withdrawal>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/withdrawals/${withdrawalId}/reject`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to reject withdrawal",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    return {
      success: false,
      message: "Network error while rejecting withdrawal",
    };
  }
}

// ============================================
// KYC API
// ============================================

/**
 * Get pending KYC submissions
 * @param token - Authentication token
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with paginated pending KYCs
 */
export async function getPendingKYCs(
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ kycs: PendingKYC[]; pagination: any }>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/kyc/admin/pending?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch pending KYCs",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching pending KYCs:", error);
    return {
      success: false,
      message: "Network error while fetching pending KYCs",
    };
  }
}

/**
 * Get KYC statistics
 * @param token - Authentication token
 * @returns Promise with KYC stats
 */
export async function getKYCStats(
  token: string
): Promise<ApiResponse<KYCStats>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/kyc/admin/stats`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch KYC stats",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching KYC stats:", error);
    return {
      success: false,
      message: "Network error while fetching KYC stats",
    };
  }
}

/**
 * Get user KYC details
 * @param token - Authentication token
 * @param userId - User ID
 * @returns Promise with KYC details
 */
export async function getUserKYC(
  token: string,
  userId: string
): Promise<ApiResponse<KYCDetails>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/kyc/admin/user/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch user KYC",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching user KYC:", error);
    return {
      success: false,
      message: "Network error while fetching user KYC",
    };
  }
}

/**
 * Review KYC (approve or reject)
 * @param token - Authentication token
 * @param payload - Review action and details
 * @returns Promise with updated KYC
 */
export async function reviewKYC(
  token: string,
  payload: ReviewKYCPayload
): Promise<ApiResponse<KYCDetails>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/kyc/admin/review`,
      {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to review KYC",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error reviewing KYC:", error);
    return {
      success: false,
      message: "Network error while reviewing KYC",
    };
  }
}
