/**
 * Types Index
 * Central export for all TypeScript types and interfaces
 */

// Export all database types
export * from "./database.types";

// Re-export commonly used types for convenience
export type {
  User,
  Wallet,
  Investment,
  Transaction,
  Approval,
  WithdrawalRequest,
  AddMoneyRequest,
  BorrowRequest,
  TransferRequest,
  Notification,
  UserHierarchyStats,
  InvestmentCommission,
  ProfileConfiguration,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "./database.types";

// Re-export enums
export {
  UserRole,
  UserStatus,
  KYCStatus,
  InvestmentProfile,
  BonusType,
  CommissionStatus,
  InvestmentStatus,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  ApprovalType,
  ApprovalStatus,
  NotificationType,
  RequestType,
  MoneyRequestStatus,
} from "./database.types";
