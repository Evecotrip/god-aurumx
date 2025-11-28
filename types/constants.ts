/**
 * Constants and Enum Values
 * Centralized constants for the MLM Investment Platform
 */

import {
  UserRole,
  UserStatus,
  KYCStatus,
  InvestmentProfile,
  InvestmentStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  MoneyRequestStatus,
  CommissionStatus,
  BonusType,
} from "./database.types";

// ==================== ENUM LABELS ====================

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.ADMIN]: "Admin",
  [UserRole.MASTER_NODE]: "Master Node",
  [UserRole.SUPPORT]: "Support",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.PENDING_VERIFICATION]: "Pending Verification",
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.SUSPENDED]: "Suspended",
  [UserStatus.BLOCKED]: "Blocked",
  [UserStatus.DELETED]: "Deleted",
};

export const KYC_STATUS_LABELS: Record<KYCStatus, string> = {
  [KYCStatus.NOT_SUBMITTED]: "Not Submitted",
  [KYCStatus.PENDING]: "Pending",
  [KYCStatus.APPROVED]: "Approved",
  [KYCStatus.REJECTED]: "Rejected",
  [KYCStatus.EXPIRED]: "Expired",
};

export const INVESTMENT_PROFILE_LABELS: Record<InvestmentProfile, string> = {
  [InvestmentProfile.BRONZE]: "Bronze",
  [InvestmentProfile.SILVER]: "Silver",
  [InvestmentProfile.GOLD]: "Gold",
  [InvestmentProfile.DIAMOND]: "Diamond",
};

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  [InvestmentStatus.PENDING_APPROVAL]: "Pending Approval",
  [InvestmentStatus.APPROVED]: "Approved",
  [InvestmentStatus.ACTIVE]: "Active",
  [InvestmentStatus.MATURED]: "Matured",
  [InvestmentStatus.WITHDRAWN]: "Withdrawn",
  [InvestmentStatus.CANCELLED]: "Cancelled",
  [InvestmentStatus.REJECTED]: "Rejected",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.INVESTMENT]: "Investment",
  [TransactionType.WITHDRAWAL]: "Withdrawal",
  [TransactionType.TRANSFER_IN]: "Transfer In",
  [TransactionType.TRANSFER_OUT]: "Transfer Out",
  [TransactionType.COMMISSION]: "Commission",
  [TransactionType.BONUS]: "Bonus",
  [TransactionType.BORROW_REQUEST]: "Borrow Request",
  [TransactionType.BORROW_PAYMENT]: "Borrow Payment",
  [TransactionType.ADD_MONEY]: "Add Money",
  [TransactionType.REFERRAL_BONUS]: "Referral Bonus",
  [TransactionType.MATURITY_PAYOUT]: "Maturity Payout",
  [TransactionType.PENALTY]: "Penalty",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "Pending",
  [TransactionStatus.PROCESSING]: "Processing",
  [TransactionStatus.COMPLETED]: "Completed",
  [TransactionStatus.FAILED]: "Failed",
  [TransactionStatus.CANCELLED]: "Cancelled",
  [TransactionStatus.REVERSED]: "Reversed",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.ONLINE_TRANSFER]: "Online Transfer",
  [PaymentMethod.PHYSICAL_CASH]: "Physical Cash",
  [PaymentMethod.UPI]: "UPI",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.NEFT]: "NEFT",
  [PaymentMethod.RTGS]: "RTGS",
  [PaymentMethod.IMPS]: "IMPS",
};

export const MONEY_REQUEST_STATUS_LABELS: Record<MoneyRequestStatus, string> = {
  [MoneyRequestStatus.PENDING]: "Pending",
  [MoneyRequestStatus.APPROVED]: "Approved",
  [MoneyRequestStatus.REJECTED]: "Rejected",
  [MoneyRequestStatus.PROCESSING]: "Processing",
  [MoneyRequestStatus.COMPLETED]: "Completed",
  [MoneyRequestStatus.CANCELLED]: "Cancelled",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  [CommissionStatus.PENDING]: "Pending",
  [CommissionStatus.SCHEDULED]: "Scheduled",
  [CommissionStatus.PROCESSING]: "Processing",
  [CommissionStatus.PAID]: "Paid",
  [CommissionStatus.FAILED]: "Failed",
  [CommissionStatus.CANCELLED]: "Cancelled",
};

export const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  [BonusType.REFERRAL_INSTANT]: "Instant Referral Bonus",
  [BonusType.REFERRAL_DELAYED]: "Delayed Referral Bonus",
  [BonusType.PROFIT_DISTRIBUTION]: "Profit Distribution",
  [BonusType.REFERRAL_ADDITIONAL]: "Additional Referral Bonus",
  [BonusType.PROFIT_ADDITIONAL]: "Additional Profit Bonus",
};

// ==================== INVESTMENT PROFILE DETAILS ====================

export interface InvestmentProfileDetails {
  name: string;
  minReturn: number;
  maxReturn: number;
  minInvestment: number;
  maxInvestment: number | null;
  lockInMonths: number;
  hierarchyLevels: number;
  description: string;
  color: string;
  icon: string;
}

export const INVESTMENT_PROFILE_DETAILS: Record<InvestmentProfile, InvestmentProfileDetails> = {
  [InvestmentProfile.BRONZE]: {
    name: "Bronze",
    minReturn: 5,
    maxReturn: 8,
    minInvestment: 10000,
    maxInvestment: 49999,
    lockInMonths: 12,
    hierarchyLevels: 5,
    description: "5-8% return - ₹10,000 to ₹49,999 - 12 months lock-in - 5 levels hierarchy",
    color: "#CD7F32",
    icon: "🥉",
  },
  [InvestmentProfile.SILVER]: {
    name: "Silver",
    minReturn: 7,
    maxReturn: 12,
    minInvestment: 50000,
    maxInvestment: 99999,
    lockInMonths: 9,
    hierarchyLevels: 8,
    description: "7-12% return - ₹50,000 to ₹99,999 - 9 months lock-in - 8 levels hierarchy",
    color: "#C0C0C0",
    icon: "🥈",
  },
  [InvestmentProfile.GOLD]: {
    name: "Gold",
    minReturn: 10,
    maxReturn: 15,
    minInvestment: 100000,
    maxInvestment: 199999,
    lockInMonths: 6,
    hierarchyLevels: 10,
    description: "10-15% return - ₹100,000 to ₹199,999 - 6 months lock-in - 10 levels hierarchy",
    color: "#FFD700",
    icon: "🥇",
  },
  [InvestmentProfile.DIAMOND]: {
    name: "Diamond",
    minReturn: 15,
    maxReturn: 20,
    minInvestment: 200000,
    maxInvestment: null,
    lockInMonths: 3,
    hierarchyLevels: 15,
    description: "15-20% return - ₹200,000+ - 3 months lock-in - 15 levels hierarchy",
    color: "#B9F2FF",
    icon: "💎",
  },
};

// ==================== STATUS COLORS ====================

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.PENDING_VERIFICATION]: "yellow",
  [UserStatus.ACTIVE]: "green",
  [UserStatus.SUSPENDED]: "orange",
  [UserStatus.BLOCKED]: "red",
  [UserStatus.DELETED]: "gray",
};

export const KYC_STATUS_COLORS: Record<KYCStatus, string> = {
  [KYCStatus.NOT_SUBMITTED]: "gray",
  [KYCStatus.PENDING]: "yellow",
  [KYCStatus.APPROVED]: "green",
  [KYCStatus.REJECTED]: "red",
  [KYCStatus.EXPIRED]: "orange",
};

export const INVESTMENT_STATUS_COLORS: Record<InvestmentStatus, string> = {
  [InvestmentStatus.PENDING_APPROVAL]: "yellow",
  [InvestmentStatus.APPROVED]: "blue",
  [InvestmentStatus.ACTIVE]: "green",
  [InvestmentStatus.MATURED]: "purple",
  [InvestmentStatus.WITHDRAWN]: "gray",
  [InvestmentStatus.CANCELLED]: "red",
  [InvestmentStatus.REJECTED]: "red",
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "yellow",
  [TransactionStatus.PROCESSING]: "blue",
  [TransactionStatus.COMPLETED]: "green",
  [TransactionStatus.FAILED]: "red",
  [TransactionStatus.CANCELLED]: "gray",
  [TransactionStatus.REVERSED]: "orange",
};

export const MONEY_REQUEST_STATUS_COLORS: Record<MoneyRequestStatus, string> = {
  [MoneyRequestStatus.PENDING]: "yellow",
  [MoneyRequestStatus.APPROVED]: "blue",
  [MoneyRequestStatus.REJECTED]: "red",
  [MoneyRequestStatus.PROCESSING]: "blue",
  [MoneyRequestStatus.COMPLETED]: "green",
  [MoneyRequestStatus.CANCELLED]: "gray",
};

// ==================== VALIDATION CONSTANTS ====================

export const VALIDATION = {
  // User
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Investment
  MIN_INVESTMENT_AMOUNT: 10000,
  MAX_INVESTMENT_AMOUNT: 10000000,
  
  // Withdrawal
  MIN_WITHDRAWAL_AMOUNT: 100,
  MAX_WITHDRAWAL_AMOUNT: 1000000,
  
  // Transfer
  MIN_TRANSFER_AMOUNT: 100,
  MAX_TRANSFER_AMOUNT: 500000,
  
  // Referral Code
  REFERRAL_CODE_LENGTH: 10,
  REFERRAL_CODE_REGEX: /^[A-Z]{3}\d{5}[A-Z]{2}$/,
  
  // Unique Code
  UNIQUE_CODE_LENGTH: 10,
  UNIQUE_CODE_REGEX: /^[A-Z]{3}\d{5}[A-Z]{2}$/,
};

// ==================== PAGINATION DEFAULTS ====================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_ORDER: "desc" as const,
};

// ==================== DATE FORMATS ====================

export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  DISPLAY_WITH_TIME: "MMM DD, YYYY hh:mm A",
  API: "YYYY-MM-DD",
  API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
  FULL: "MMMM DD, YYYY",
};

// ==================== CURRENCY ====================

export const CURRENCY = {
  SYMBOL: "₹",
  CODE: "INR",
  LOCALE: "en-IN",
  USDT_SYMBOL: "USDT",
  USDT_DECIMALS: 8,
};

// ==================== COMMISSION DEFAULTS ====================

export const COMMISSION_DEFAULTS = {
  DELAYED_PAYMENT_DAYS: 30,
  MAX_HIERARCHY_LEVELS: 15,
  INSTANT_BONUS_PERCENTAGE: 5,
  DELAYED_BONUS_PERCENTAGE: 2.5,
};

// ==================== FILE UPLOAD ====================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};

// ==================== NOTIFICATION SETTINGS ====================

export const NOTIFICATION_SETTINGS = {
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY_MS: 5000,
  BATCH_SIZE: 100,
};

// ==================== SESSION SETTINGS ====================

export const SESSION_SETTINGS = {
  TOKEN_EXPIRY_DAYS: 7,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  MAX_SESSIONS_PER_USER: 5,
};

// ==================== ROUTES ====================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  QUEUE: "/queue",
  VALIDATE_REGISTER: "/validate-and-register-user",
  
  // User
  PROFILE: "/profile",
  SETTINGS: "/settings",
  
  // Investment
  INVESTMENTS: "/investments",
  NEW_INVESTMENT: "/investments/new",
  INVESTMENT_DETAIL: (id: string) => `/investments/${id}`,
  
  // Wallet
  WALLET: "/wallet",
  ADD_MONEY: "/wallet/add-money",
  WITHDRAW: "/wallet/withdraw",
  TRANSFER: "/wallet/transfer",
  
  // Hierarchy
  NETWORK: "/network",
  REFERRALS: "/referrals",
  
  // Admin
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_INVESTMENTS: "/admin/investments",
  ADMIN_APPROVALS: "/admin/approvals",
  ADMIN_SETTINGS: "/admin/settings",
};

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  LOGOUT: "/api/v1/auth/logout",
  VALIDATE_REFERRAL: "/api/v1/auth/validate-referral",
  EXCHANGE: "/api/v1/auth/exchange",
  ME: "/api/v1/auth/me",
  
  // User
  USERS: "/api/v1/users",
  USER_PROFILE: (id: string) => `/api/v1/users/${id}`,
  
  // Investment
  INVESTMENTS: "/api/v1/investments",
  INVESTMENT_DETAIL: (id: string) => `/api/v1/investments/${id}`,
  
  // Wallet
  WALLET: "/api/v1/wallet",
  ADD_MONEY: "/api/v1/wallet/add-money",
  WITHDRAW: "/api/v1/wallet/withdraw",
  TRANSFER: "/api/v1/wallet/transfer",
  
  // Hierarchy
  HIERARCHY: "/api/v1/hierarchy",
  REFERRALS: "/api/v1/hierarchy/referrals",
};
