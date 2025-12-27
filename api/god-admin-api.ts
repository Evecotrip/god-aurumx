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

// User Management Types
export interface UserWallet {
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
  investedAmount: string;
  totalEarnings: string;
}

export interface ReferredByUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
}

export interface User {
  id: string;
  uniqueCode: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  kycStatus: string;
  kycVerifiedAt: string | null;
  role: string;
  status: string;
  referralCode: string;
  referredById: string | null;
  hierarchyLevel: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  referredBy: ReferredByUser | null;
  wallet: UserWallet;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface TransactionByType {
  type: string;
  count: number;
  totalAmount: string;
}

export interface TransactionByStatus {
  status: string;
  count: number;
}

export interface RecentTransaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
  description: string;
}

export interface TransactionStats {
  total: number;
  byType: TransactionByType[];
  byStatus: TransactionByStatus[];
  recent: RecentTransaction[];
}

export interface RecentBalanceLog {
  id: string;
  operation: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
  description: string;
  createdAt: string;
}

export interface BalanceLogStats {
  total: number;
  recent: RecentBalanceLog[];
}

export interface InvestmentByProfile {
  profile: string;
  count: number;
  totalAmount: string;
}

export interface RecentInvestment {
  id: string;
  referenceId: string;
  profile: string;
  amount: string;
  status: string;
  createdAt: string;
  maturityDate: string;
}

export interface InvestmentStats {
  total: number;
  active: number;
  matured: number;
  totalInvested: string;
  byProfile: InvestmentByProfile[];
  recent: RecentInvestment[];
}

export interface CommissionByType {
  type: string;
  count: number;
  totalAmount: string;
}

export interface RecentCommission {
  id: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
  description: string;
}

export interface CommissionStats {
  total: number;
  totalEarned: string;
  byType: CommissionByType[];
  recent: RecentCommission[];
}

export interface HierarchyStats {
  directReferrals: number;
  totalDownline: number;
  maxDepth: number;
}

export interface RecentWithdrawalRequest {
  id: string;
  amount: string;
  status: string;
  method: string;
  createdAt: string;
}

export interface WithdrawalStats {
  total: number;
  totalAmount: string;
  pending: number;
  completed: number;
  recent: RecentWithdrawalRequest[];
}

export interface RecentAddMoneyRequest {
  id: string;
  amount: string;
  bonusAmount: string;
  totalAmount: string;
  status: string;
  method: string;
  createdAt: string;
}

export interface AddMoneyRequestStats {
  total: number;
  totalAmount: string;
  pending: number;
  completed: number;
  recent: RecentAddMoneyRequest[];
}

export interface UserStatsWallet extends UserWallet {
  id: string;
  lockedProfitBalance: string;
  totalCommissions: string;
  totalReturns: string;
  totalBonus: string;
  totalInvested: string;
  totalWithdrawn: string;
  totalTransferred: string;
  totalBorrowed: string;
  totalLent: string;
  lastWithdrawalAt: string | null;
  withdrawalUnlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatsData {
  user: User;
  wallet: UserStatsWallet;
  transactions: TransactionStats;
  balanceLogs: BalanceLogStats;
  investments: InvestmentStats;
  commissions: CommissionStats;
  hierarchy: HierarchyStats;
  withdrawals: WithdrawalStats;
  addMoneyRequests: AddMoneyRequestStats;
}

// Daily Profit Range Types
export interface ProfileRateRange {
  minRate: string;
  maxRate: string;
}

export interface DailyProfitRangeData {
  bronze: ProfileRateRange;
  silver: ProfileRateRange;
  gold: ProfileRateRange;
  diamond: ProfileRateRange;
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

// ============================================
// USER MANAGEMENT API
// ============================================

/**
 * Get all users with optional filters
 * @param token - Authentication token
 * @param filters - Optional filters (page, limit, status, search)
 * @returns Promise with paginated users
 */
export async function getAllUsers(
  token: string,
  filters?: UserFilters
): Promise<ApiResponse<User[]> & { pagination?: any }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/api/v1/god-admin/users${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch users",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Network error while fetching users",
    };
  }
}

/**
 * Get user statistics by user ID
 * @param token - Authentication token
 * @param userId - User ID
 * @returns Promise with detailed user statistics
 */
export async function getUserStats(
  token: string,
  userId: string
): Promise<ApiResponse<UserStatsData>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/god-admin/users/${userId}/stats`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch user stats",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      message: "Network error while fetching user stats",
    };
  }
}

// ============================================
// DAILY PROFIT RANGE API
// ============================================

/**
 * Get today's daily profit rate ranges for all investment profiles
 * @param token - Authentication token
 * @returns Promise with rate ranges for bronze, silver, gold, and diamond profiles
 */
export async function getDailyProfitRange(
  token: string
): Promise<ApiResponse<DailyProfitRangeData>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/admin/daily-rates/today/range`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      const errorData = await safeJsonParse<any>(response);
      return {
        success: false,
        message: errorData.message || "Failed to fetch daily profit range",
      };
    }

    return await safeJsonParse(response);
  } catch (error) {
    console.error("Error fetching daily profit range:", error);
    return {
      success: false,
      message: "Network error while fetching daily profit range",
    };
  }
}
