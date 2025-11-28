/**
 * Database Types and Interfaces
 * Generated from Prisma Schema
 * MLM Investment Platform
 */

// ==================== ENUMS ====================

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MASTER_NODE = "MASTER_NODE",
  SUPPORT = "SUPPORT",
}

export enum UserStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export enum KYCStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum InvestmentProfile {
  BRONZE = "BRONZE", // 5-8% return - ₹10,000 to ₹49,999 - 12 months lock-in - 5 levels hierarchy
  SILVER = "SILVER", // 7-12% return - ₹50,000 to ₹999,999 - 9 months lock-in - 8 levels hierarchy
  GOLD = "GOLD", // 10-15% return - ₹100,000 to ₹1,999,999 - 6 months lock-in - 10 levels hierarchy
  DIAMOND = "DIAMOND", // 15-20% return - ₹200,000+ - 3 months lock-in - 15 levels hierarchy
}

export enum BonusType {
  REFERRAL_INSTANT = "REFERRAL_INSTANT",
  REFERRAL_DELAYED = "REFERRAL_DELAYED",
  PROFIT_DISTRIBUTION = "PROFIT_DISTRIBUTION",
  REFERRAL_ADDITIONAL = "REFERRAL_ADDITIONAL",
  PROFIT_ADDITIONAL = "PROFIT_ADDITIONAL",
}

export enum CommissionStatus {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum InvestmentStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  MATURED = "MATURED",
  WITHDRAWN = "WITHDRAWN",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export enum TransactionType {
  INVESTMENT = "INVESTMENT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
  COMMISSION = "COMMISSION",
  BONUS = "BONUS",
  BORROW_REQUEST = "BORROW_REQUEST",
  BORROW_PAYMENT = "BORROW_PAYMENT",
  ADD_MONEY = "ADD_MONEY",
  REFERRAL_BONUS = "REFERRAL_BONUS",
  MATURITY_PAYOUT = "MATURITY_PAYOUT",
  PENALTY = "PENALTY",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REVERSED = "REVERSED",
}

export enum PaymentMethod {
  ONLINE_TRANSFER = "ONLINE_TRANSFER",
  PHYSICAL_CASH = "PHYSICAL_CASH",
  UPI = "UPI",
  BANK_TRANSFER = "BANK_TRANSFER",
  NEFT = "NEFT",
  RTGS = "RTGS",
  IMPS = "IMPS",
}

export enum ApprovalType {
  INVESTMENT = "INVESTMENT",
  WITHDRAWAL = "WITHDRAWAL",
  BORROW = "BORROW",
  TRANSFER = "TRANSFER",
  ADD_MONEY = "ADD_MONEY",
  USER_REGISTRATION = "USER_REGISTRATION",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
  IN_APP = "IN_APP",
  PUSH = "PUSH",
}

export enum RequestType {
  WITHDRAWAL = "WITHDRAWAL",
  BORROW = "BORROW",
  ADD_MONEY = "ADD_MONEY",
  TRANSFER = "TRANSFER",
}

export enum MoneyRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ==================== INTERFACES ====================

// Address Interface
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}

// KYC Documents Interface
export interface KYCDocuments {
  aadhaar?: string;
  pan?: string;
  photo?: string;
  [key: string]: string | undefined;
}

// User Interface
export interface User {
  id: string;
  clerkId: string | null;
  uniqueCode: string;
  email: string;
  phone: string;
  password?: string | null;

  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  address?: Address | null;

  // KYC Information
  kycStatus: KYCStatus;
  kycDocuments?: KYCDocuments | null;
  kycVerifiedAt?: Date | null;
  kycRejectionReason?: string | null;

  // Role and Status
  role: UserRole;
  status: UserStatus;

  // Referral System
  referralCode: string;
  referredById?: string | null;

  // Legacy Hierarchy Fields
  hierarchyLevel: number;
  hierarchyPath: string[];

  // Authentication
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;

  // Timestamps
  lastLoginAt?: Date | null;
  passwordChangedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  // Relations (optional - loaded when needed)
  wallet?: Wallet;
  investments?: Investment[];
  hierarchyStats?: UserHierarchyStats;
  referredBy?: User | null;
  referredUsers?: User[];
}

// Wallet Interface
export interface Wallet {
  id: string;
  userId: string;

  // Balance Management
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
  investedAmount: string;

  // Earnings
  totalEarnings: string;
  totalCommissions: string;
  totalReturns: string;
  totalBonus: string;

  // Statistics
  totalInvested: string;
  totalWithdrawn: string;
  lastWithdrawalAt?: Date | null;
  withdrawalUnlockedAt?: Date | null;
  totalTransferred: string;
  totalBorrowed: string;
  totalLent: string;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  transactions?: Transaction[];
  balanceLogs?: BalanceLog[];
}

// Investment Interface
export interface Investment {
  id: string;
  userId: string;

  // Investment Details
  amount: string;
  profile: InvestmentProfile;

  // Return Rates
  minReturnRate: string;
  maxReturnRate: string;
  actualReturnRate?: string | null;

  // Lock-in Configuration
  lockInMonths: number;
  hierarchyDepth: number;

  // Calculated Values
  expectedMinReturn: string;
  expectedMaxReturn: string;
  actualReturn?: string | null;
  maturityAmount?: string | null;
  maturityDate: Date;

  // Status Tracking
  status: InvestmentStatus;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  activatedAt?: Date | null;
  maturedAt?: Date | null;
  withdrawnAt?: Date | null;

  // Profile Configuration Snapshot
  profileConfig: Record<string, any>;

  // Additional Info
  referenceId: string;
  notes?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  transactions?: Transaction[];
  approval?: Approval;
  returns?: InvestmentReturn[];
  commissions?: InvestmentCommission[];
}

// Investment Return Interface
export interface InvestmentReturn {
  id: string;
  investmentId: string;
  amount: string;
  returnType: string;
  calculatedAt: Date;
  creditedAt?: Date | null;
  transactionId?: string | null;
  createdAt: Date;

  // Relations
  investment?: Investment;
  transaction?: Transaction;
}

// Transaction Interface
export interface Transaction {
  id: string;
  senderId?: string | null;
  receiverId?: string | null;

  // Transaction Details
  type: TransactionType;
  amount: string;
  fee: string;
  netAmount: string;

  // Reference Information
  referenceId: string;
  externalRef?: string | null;

  // Status and Method
  status: TransactionStatus;
  paymentMethod?: PaymentMethod | null;

  // Related Entities
  walletId?: string | null;
  investmentId?: string | null;

  // Screenshot/Proof
  screenshotUrl?: string | null;
  screenshotUploadedAt?: Date | null;
  screenshotVerifiedAt?: Date | null;

  // Metadata
  metadata?: Record<string, any> | null;
  description?: string | null;
  notes?: string | null;

  // Timestamps
  processedAt?: Date | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  reversedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  sender?: User;
  receiver?: User;
  wallet?: Wallet;
  investment?: Investment;
  approval?: Approval;
  investmentCommission?: InvestmentCommission;
  balanceLogs?: BalanceLog[];
  investmentReturn?: InvestmentReturn;
}

// Balance Log Interface
export interface BalanceLog {
  id: string;
  walletId: string;
  transactionId?: string | null;
  previousBalance: string;
  amount: string;
  newBalance: string;
  operation: string;
  description?: string | null;
  createdAt: Date;

  // Relations
  wallet?: Wallet;
  transaction?: Transaction;
}

// Approval Interface
export interface Approval {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;

  // Requester and Approver
  requesterId: string;
  approverId: string;

  // Related Entity
  entityId: string;
  entityType: string;

  // Approval Details
  requestData: Record<string, any>;
  responseData?: Record<string, any> | null;

  // Screenshot
  screenshotUrl?: string | null;

  // Notes and Reasons
  requestNotes?: string | null;
  approvalNotes?: string | null;
  rejectionReason?: string | null;

  // Timestamps
  requestedAt: Date;
  respondedAt?: Date | null;
  expiresAt?: Date | null;

  // Relations
  requester?: User;
  approver?: User;
  investment?: Investment;
  transaction?: Transaction;
}

// Withdrawal Request Interface
export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: string;
  method: PaymentMethod;
  status: MoneyRequestStatus;

  // Bank Details
  bankDetails?: Record<string, any> | null;

  // Contact Details
  contactDetails?: Record<string, any> | null;

  // Processing Information
  processedBy?: string | null;
  processedAt?: Date | null;

  // Screenshot/Proof
  paymentProof?: string | null;
  transactionRef?: string | null;

  // Notes
  userNotes?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Borrow Request Interface
export interface BorrowRequest {
  id: string;
  borrowerId: string;
  lenderId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: MoneyRequestStatus;

  // Payment Details
  borrowerDetails: Record<string, any>;
  lenderDetails?: Record<string, any> | null;

  // Processing
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  completedAt?: Date | null;

  // Proof
  paymentProof?: string | null;
  confirmationProof?: string | null;

  // Notes
  borrowerNotes?: string | null;
  lenderNotes?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  borrower?: User;
  lender?: User;
}

// Transfer Request Interface
export interface TransferRequest {
  id: string;
  senderId: string;
  receiverId: string;
  amount: string;
  status: MoneyRequestStatus;

  // Processing
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  completedAt?: Date | null;

  // Notes
  senderNotes?: string | null;
  receiverNotes?: string | null;
  rejectionReason?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  sender?: User;
  receiver?: User;
}

// Add Money Request Interface
export interface AddMoneyRequest {
  id: string;
  userId: string;

  // Currency Selection
  currency: string;
  currencyAmount: string;

  // USDT Conversion
  usdtAmount: string;
  exchangeRate: string;
  exchangeRateSource?: string | null;
  rateTimestamp?: Date | null;

  // Request Details
  amount: string; // DEPRECATED
  bonusAmount: string;
  totalAmount: string;

  // Bank Details Management
  bankDetailsProvided?: Record<string, any> | null;
  bankDetailsSentAt?: Date | null;
  bankDetailsSentBy?: string | null;

  // Payment Method
  method: string;
  status: MoneyRequestStatus;

  // Payment Details
  paymentDetails?: Record<string, any> | null;

  // Processing
  masterNodeId?: string | null;
  processedAt?: Date | null;
  verifiedAt?: Date | null;

  // Screenshot/Proof
  paymentProof?: string | null;
  screenshotUploadedAt?: Date | null;
  screenshotVerifiedAt?: Date | null;
  transactionRef?: string | null;

  // Notes
  userNotes?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Currency Bank Account Interface
export interface CurrencyBankAccount {
  id: string;
  currency: string;
  currencyName: string;
  currencySymbol: string;
  bankAccounts: Record<string, any>;
  qrCodeUrl?: string | null;
  qrCodeProvider?: string | null;
  instructions?: string | null;
  isActive: boolean;
  priority: number;
  minAmount?: string | null;
  maxAmount?: string | null;
  countryCode?: string | null;
  processingTime?: string | null;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string | null;
}

// Exchange Rate Log Interface
export interface ExchangeRateLog {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  source: string;
  requestId?: string | null;
  isManualRate: boolean;
  setBy?: string | null;
  createdAt: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;

  // Delivery Status
  sent: boolean;
  sentAt?: Date | null;
  delivered: boolean;
  deliveredAt?: Date | null;
  read: boolean;
  readAt?: Date | null;

  // Error Handling
  failed: boolean;
  failureReason?: string | null;
  retryCount: number;

  // Metadata
  metadata?: Record<string, any> | null;
  priority: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Session Interface
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string | null;

  // Device Information
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceId?: string | null;
  deviceType?: string | null;

  // Session Management
  isActive: boolean;
  lastActivityAt: Date;
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Activity Log Interface
export interface ActivityLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;

  // Request Information
  ipAddress?: string | null;
  userAgent?: string | null;
  method?: string | null;
  endpoint?: string | null;

  // Additional Data
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  metadata?: Record<string, any> | null;

  createdAt: Date;

  // Relations
  user?: User;
}

// System Config Interface
export interface SystemConfig {
  id: string;
  key: string;
  value: Record<string, any>;
  description?: string | null;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string | null;
}

// Screenshot Interface
export interface Screenshot {
  id: string;
  entityType: string;
  entityId: string;
  url: string;
  cloudinaryId?: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  scheduledForDeletion?: Date | null;
  deletedAt?: Date | null;
}

// User Hierarchy Interface
export interface UserHierarchy {
  id: string;
  ancestorId: string;
  descendantId: string;
  depth: number;
  path: string[];
  position?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  ancestor?: User;
  descendant?: User;
}

// User Hierarchy Stats Interface
export interface UserHierarchyStats {
  id: string;
  userId: string;

  // Direct Statistics
  directReferralCount: number;
  totalDescendants: number;

  // Level-wise counts
  levelCounts: Record<string, number>;

  // Performance Metrics
  totalTeamInvestment: string;
  totalTeamCommission: string;
  activeTeamMembers: number;

  // Depth Information
  maxDepth: number;

  // Monthly Snapshots
  monthlyStats: any[];

  // Last Calculation Times
  lastCalculatedAt: Date;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Commission Rate Interface
export interface CommissionRate {
  id: string;
  level: number;
  percentage: string;
  minInvestment?: string | null;
  minTeamSize?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rank Achievement Interface
export interface RankAchievement {
  id: string;
  userId: string;
  rankName: string;
  rankLevel: number;

  // Achievement Criteria Met
  personalInvestment: string;
  teamInvestment: string;
  directReferrals: number;
  totalTeamSize: number;

  // Rewards
  bonusAmount: string;
  commissionBoost: string;

  achievedAt: Date;
  expiresAt?: Date | null;
}

// Profile Configuration Interface
export interface ProfileConfiguration {
  id: string;
  profile: InvestmentProfile;

  // Investment Range
  minInvestment: string;
  maxInvestment?: string | null;

  // Return Rates
  minReturnRate: string;
  maxReturnRate: string;

  // Lock-in Period
  lockInMonths: number;

  // Hierarchy Configuration
  maxHierarchyDepth: number;

  // Status
  isActive: boolean;
  priority: number;

  // Metadata
  description?: string | null;
  features?: Record<string, any> | null;

  // Version Control
  version: number;
  updatedBy?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// Referral Bonus Config Interface
export interface ReferralBonusConfig {
  id: string;
  level: number;

  // Percentage Configuration
  totalPercentage: string;
  instantPercentage: string;
  delayedPercentage: string;

  // Delay Configuration
  delayDays: number;

  // For levels 2-4
  parentMultiplier?: string | null;

  // Status
  isActive: boolean;

  // Version Control
  version: number;
  updatedBy?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// Profit Distribution Config Interface
export interface ProfitDistributionConfig {
  id: string;
  level: number;
  percentage: string;
  formula?: string | null;
  isActive: boolean;
  version: number;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Investment Commission Interface
export interface InvestmentCommission {
  id: string;
  investmentId: string;
  beneficiaryId: string;

  // Commission Details
  bonusType: BonusType;
  level: number;

  // Amount Calculation
  baseAmount: string;
  percentage: string;
  amount: string;

  // Payment Schedule
  status: CommissionStatus;
  scheduledDate?: Date | null;
  paidAt?: Date | null;

  // Transaction Reference
  transactionId?: string | null;

  // Metadata
  configSnapshot: Record<string, any>;
  notes?: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  investment?: Investment;
  beneficiary?: User;
  transaction?: Transaction;
}

// Commission Payment Batch Interface
export interface CommissionPaymentBatch {
  id: string;
  batchDate: Date;
  bonusType: BonusType;

  // Processing Status
  status: string;
  totalCommissions: number;
  processedCount: number;
  failedCount: number;
  totalAmount: string;

  // Processing Information
  startedAt?: Date | null;
  completedAt?: Date | null;
  processedBy?: string | null;

  // Error Handling
  errors?: Record<string, any> | null;

  createdAt: Date;
  updatedAt: Date;
}

// Profile Config History Interface
export interface ProfileConfigHistory {
  id: string;
  profileConfigId: string;
  profile: InvestmentProfile;
  changeType: string;
  previousData?: Record<string, any> | null;
  newData: Record<string, any>;
  changedBy: string;
  changeReason?: string | null;
  version: number;
  affectedInvestments: number;
  createdAt: Date;
}

// Global Config Interface
export interface GlobalConfig {
  id: string;
  key: string;
  value: Record<string, any>;
  dataType: string;
  category: string;
  description?: string | null;
  validationRules?: Record<string, any> | null;
  isActive: boolean;
  isEditable: boolean;
  version: number;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== UTILITY TYPES ====================

// Partial types for creation/updates
export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<CreateUserInput>;

export type CreateInvestmentInput = Omit<Investment, "id" | "createdAt" | "updatedAt">;
export type UpdateInvestmentInput = Partial<CreateInvestmentInput>;

export type CreateTransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
