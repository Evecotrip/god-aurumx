/**
 * Utility Types and Type Guards
 * Helper types and functions for type safety
 */

import {
  User,
  UserStatus,
  KYCStatus,
  Investment,
  InvestmentStatus,
  Transaction,
  TransactionStatus,
  Wallet,
} from "./database.types";

// ==================== TYPE GUARDS ====================

/**
 * Check if user is active
 */
export function isUserActive(user: User): boolean {
  return user.status === UserStatus.ACTIVE;
}

/**
 * Check if user is pending verification
 */
export function isUserPendingVerification(user: User): boolean {
  return user.status === UserStatus.PENDING_VERIFICATION;
}

/**
 * Check if user is suspended or blocked
 */
export function isUserRestricted(user: User): boolean {
  return user.status === UserStatus.SUSPENDED || user.status === UserStatus.BLOCKED;
}

/**
 * Check if user KYC is approved
 */
export function isKYCApproved(user: User): boolean {
  return user.kycStatus === KYCStatus.APPROVED;
}

/**
 * Check if user KYC is pending
 */
export function isKYCPending(user: User): boolean {
  return user.kycStatus === KYCStatus.PENDING;
}

/**
 * Check if investment is active
 */
export function isInvestmentActive(investment: Investment): boolean {
  return investment.status === InvestmentStatus.ACTIVE;
}

/**
 * Check if investment is matured
 */
export function isInvestmentMatured(investment: Investment): boolean {
  return investment.status === InvestmentStatus.MATURED;
}

/**
 * Check if investment is pending approval
 */
export function isInvestmentPendingApproval(investment: Investment): boolean {
  return investment.status === InvestmentStatus.PENDING_APPROVAL;
}

/**
 * Check if transaction is completed
 */
export function isTransactionCompleted(transaction: Transaction): boolean {
  return transaction.status === TransactionStatus.COMPLETED;
}

/**
 * Check if transaction is pending
 */
export function isTransactionPending(transaction: Transaction): boolean {
  return transaction.status === TransactionStatus.PENDING;
}

/**
 * Check if transaction is failed
 */
export function isTransactionFailed(transaction: Transaction): boolean {
  return transaction.status === TransactionStatus.FAILED;
}

/**
 * Check if user has sufficient balance
 */
export function hasSufficientBalance(wallet: Wallet, amount: string): boolean {
  return parseFloat(wallet.availableBalance) >= parseFloat(amount);
}

/**
 * Check if user can withdraw
 */
export function canUserWithdraw(user: User, wallet: Wallet): boolean {
  return (
    isUserActive(user) &&
    isKYCApproved(user) &&
    parseFloat(wallet.availableBalance) > 0
  );
}

/**
 * Check if user can invest
 */
export function canUserInvest(user: User): boolean {
  return isUserActive(user) && isKYCApproved(user);
}

// ==================== UTILITY TYPES ====================

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit by type
 */
export type OmitByType<T, U> = Pick<T, Exclude<keyof T, KeysOfType<T, U>>>;

/**
 * Pick by type
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

// ==================== FORM TYPES ====================

/**
 * Form field error
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

/**
 * Form state
 */
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ==================== API TYPES ====================

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * API success response with data
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
}

/**
 * Generic API response
 */
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== FILTER TYPES ====================

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from: Date;
  to: Date;
}

/**
 * Amount range filter
 */
export interface AmountRangeFilter {
  min: number;
  max: number;
}

/**
 * Generic filter
 */
export interface Filter<T> {
  field: keyof T;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains";
  value: any;
}

/**
 * Sort options
 */
export interface SortOption<T> {
  field: keyof T;
  order: "asc" | "desc";
}

/**
 * Query options
 */
export interface QueryOptions<T> {
  filters?: Filter<T>[];
  sort?: SortOption<T>;
  page?: number;
  limit?: number;
}

// ==================== DASHBOARD TYPES ====================

/**
 * Dashboard stats
 */
export interface DashboardStats {
  totalInvestment: string;
  totalEarnings: string;
  activeInvestments: number;
  totalReferrals: number;
  pendingApprovals: number;
  availableBalance: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Time series data
 */
export interface TimeSeriesData {
  date: string;
  value: number;
}

// ==================== NOTIFICATION TYPES ====================

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ==================== TABLE TYPES ====================

/**
 * Table column definition
 */
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

/**
 * Table action
 */
export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  variant?: "primary" | "secondary" | "danger";
}

/**
 * Table props
 */
export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
}

// ==================== HIERARCHY TYPES ====================

/**
 * Tree node for hierarchy visualization
 */
export interface HierarchyTreeNode {
  id: string;
  name: string;
  email: string;
  uniqueCode: string;
  level: number;
  directReferrals: number;
  totalTeam: number;
  totalInvestment: string;
  status: UserStatus;
  children?: HierarchyTreeNode[];
}

/**
 * Level statistics
 */
export interface LevelStats {
  level: number;
  count: number;
  totalInvestment: string;
  activeMembers: number;
}

// ==================== EXPORT TYPES ====================

/**
 * Export format
 */
export type ExportFormat = "csv" | "excel" | "pdf";

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  columns?: string[];
  filters?: any;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency
 */
export function formatCurrency(amount: string | number, currency: string = "INR"): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format USDT
 */
export function formatUSDT(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(8)} USDT`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: string | number): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return `${numValue.toFixed(2)}%`;
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: string = "MMM DD, YYYY"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Simple implementation - use a library like date-fns or dayjs in production
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate return amount
 */
export function calculateReturnAmount(
  principal: string | number,
  rate: string | number
): number {
  const p = typeof principal === "string" ? parseFloat(principal) : principal;
  const r = typeof rate === "string" ? parseFloat(rate) : rate;
  return (p * r) / 100;
}

/**
 * Calculate maturity amount
 */
export function calculateMaturityAmount(
  principal: string | number,
  rate: string | number
): number {
  const p = typeof principal === "string" ? parseFloat(principal) : principal;
  const returnAmount = calculateReturnAmount(principal, rate);
  return p + returnAmount;
}

/**
 * Get days until date
 */
export function getDaysUntil(date: Date | string): number {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is past
 */
export function isDatePast(date: Date | string): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate.getTime() < Date.now();
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Generate reference ID
 */
export function generateReferenceId(prefix: string): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}
