'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Filter,
  Search,
  Eye,
  Send,
  Check,
  X,
  Loader2,
  LogOut,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { getTokenFromCookies, removeTokenFromCookies } from '@/api/token-user-api';
import {
  getDashboardStats,
  getAllRequests,
  getPendingRequests,
  getRequestById,
  sendBankDetails,
  verifyRequest,
  rejectRequest,
  type DashboardStats,
  type AddMoneyRequest,
  type RequestFilters
} from '@/api/master-node-api';
import {
  getPendingWithdrawals,
  processWithdrawal,
  rejectWithdrawal,
  type Withdrawal
} from '@/api/god-admin-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<AddMoneyRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AddMoneyRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'withdrawals'>('pending');
  const [filters, setFilters] = useState<RequestFilters>({
    page: 1,
    limit: 20,
    status: '',
    currency: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Withdrawal & KYC states
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [withdrawalAdminNotes, setWithdrawalAdminNotes] = useState('');

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!token) return;

    console.log('Fetching stats with token:', token);
    const response = await getDashboardStats(token);
    console.log('Stats response:', response);
    if (response.success && response.data) {
      console.log('Setting stats:', response.data);
      setStats(response.data);
    } else {
      console.error('Failed to fetch stats:', response.message);
      setError(response.message || 'Failed to fetch dashboard stats');
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    if (!token) {
      console.log('No token available for fetching requests');
      return;
    }

    console.log('Fetching requests - Tab:', activeTab, 'Filters:', filters);
    setLoading(true);
    try {
      // For pending tab, use getAllRequests with status=PENDING filter
      const requestFilters = activeTab === 'pending'
        ? { ...filters, status: 'PROCESSING' }
        : filters;

      const response = await getAllRequests(token, requestFilters);

      console.log('Requests response:', response);

      if (response.success) {
        // API returns data as array directly, and pagination separately
        const requestsData = Array.isArray(response.data) ? response.data : [];
        const paginationData = (response as any).pagination || null;

        console.log('Setting requests:', requestsData);
        console.log('Setting pagination:', paginationData);
        setRequests(requestsData);
        setPagination(paginationData);
      } else {
        console.error('Failed to fetch requests:', response.message);
        setError(response.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await getPendingWithdrawals(token, filters.page, filters.limit);
      
      if (response.success && response.data) {
        setWithdrawals(Array.isArray(response.data) ? response.data : []);
        setPagination((response as any).pagination || pagination);
      } else {
        setError(response.message || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError('Error fetching withdrawals');
    } finally {
      setLoading(false);
    }
  };


  // Get token on client side
  useEffect(() => {
    const initializeToken = async () => {
      let authToken = getTokenFromCookies();
      console.log('Retrieved token from cookies:', authToken);

      // If no token but user is authenticated, generate one
      if (!authToken && user?.id) {
        console.log('No token found, generating new token for user:', user.id);
        const { generateToken: genToken, storeTokenInCookies: storeToken } = await import('@/api/token-user-api');
        const tokenResponse = await genToken(user.id);

        if (tokenResponse.success && tokenResponse.data?.token) {
          authToken = tokenResponse.data.token;
          storeToken(authToken);
          console.log('Token generated and stored successfully');
        } else {
          console.error('Failed to generate token:', tokenResponse.message);
          setError('Failed to generate authentication token. Please login again.');
          return;
        }
      }

      setToken(authToken);

      if (!authToken) {
        console.error('No token available!');
        setError('Authentication token not found. Please login again.');
      }
    };

    if (user) {
      initializeToken();
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!token) return;

    fetchStats();
    
    // Fetch data based on active tab
    if (activeTab === 'withdrawals') {
      fetchWithdrawals(); 
    } else {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, token, activeTab, filters]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Remove backend token
      removeTokenFromCookies();

      // Sign out from Clerk
      await signOut();

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push('/login');
    }
  };

  // Handle view details
  const handleViewDetails = async (requestId: string) => {
    if (!token) return;

    setActionLoading(true);
    const response = await getRequestById(token, requestId);
    if (response.success && response.data) {
      setSelectedRequest(response.data);
      setShowDetailsModal(true);
    }
    setActionLoading(false);
  };

  // Handle send bank details
  const handleSendBankDetails = async (requestId: string) => {
    if (!token) return;

    setActionLoading(true);
    const response = await sendBankDetails(token, requestId);
    if (response.success) {
      await fetchRequests();
      await fetchStats();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(response.data || null);
      }
    } else {
      setError(response.message || 'Failed to send bank details');
    }
    setActionLoading(false);
  };

  // Handle verify request
  const handleVerify = async () => {
    if (!token || !selectedRequest) return;

    setActionLoading(true);
    const response = await verifyRequest(token, selectedRequest.id, { adminNotes });
    if (response.success) {
      setShowVerifyModal(false);
      setShowDetailsModal(false);
      setAdminNotes('');
      await fetchRequests();
      await fetchStats();
    } else {
      setError(response.message || 'Failed to verify request');
    }
    setActionLoading(false);
  };

  // Handle reject request
  const handleReject = async () => {
    if (!token || !selectedRequest) return;

    setActionLoading(true);
    const response = await rejectRequest(token, selectedRequest.id, { rejectionReason });
    if (response.success) {
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectionReason('');
      await fetchRequests();
      await fetchStats();
    } else {
      setError(response.message || 'Failed to reject request');
    }
    setActionLoading(false);
  };

  // Handle view withdrawal details
  const handleViewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalModal(true);
  };

  // Handle process withdrawal
  const handleProcessWithdrawal = async () => {
    if (!token || !selectedWithdrawal) return;
    
    setActionLoading(true);
    const response = await processWithdrawal(token, selectedWithdrawal.id, {
      transactionRef,
      adminNotes: withdrawalAdminNotes
    });
    
    if (response.success) {
      setShowWithdrawalModal(false);
      setTransactionRef('');
      setWithdrawalAdminNotes('');
      await fetchWithdrawals();
    } else {
      setError(response.message || 'Failed to process withdrawal');
    }
    setActionLoading(false);
  };

  // Handle reject withdrawal
  const handleRejectWithdrawal = async () => {
    if (!token || !selectedWithdrawal) return;
    
    setActionLoading(true);
    const response = await rejectWithdrawal(token, selectedWithdrawal.id, {
      rejectionReason
    });
    
    if (response.success) {
      setShowWithdrawalModal(false);
      setRejectionReason('');
      await fetchWithdrawals();
    } else {
      setError(response.message || 'Failed to reject withdrawal');
    }
    setActionLoading(false);
  };


  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
      PENDING: 'warning',
      PROCESSING: 'info',
      COMPLETED: 'success',
      REJECTED: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Master Node</h1>
                <p className="text-xs text-muted-foreground">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/users')}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </button>
              <button
                onClick={() => router.push('/currency-settings')}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card gradient className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-16 h-16 text-amber-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription>Pending Requests</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-500">
                {stats ? stats.pending : '0'}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card gradient className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-blue-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription>Processing</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-500">
                {stats ? stats.processing : '0'}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card gradient className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-500">
                {stats ? stats.completed : '0'}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card gradient className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-violet-500" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription>Total USDT Credited</CardDescription>
              <CardTitle className="text-3xl font-bold text-violet-500">
                {stats ? stats.totalUsdtCredited : '0.00'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="border-white/5 bg-card/50">
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex bg-secondary/50 p-1 rounded-lg overflow-x-auto">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'pending'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                >
                  Pending Requests
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                >
                  All Requests
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'withdrawals'
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                >
                  Withdrawals
                </button>
                
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters({ ...filters, currency: e.target.value, page: 1 })}
                  className="h-10 px-3 rounded-lg bg-secondary/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Currencies</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>

                {activeTab === 'all' && (
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="h-10 px-3 rounded-lg bg-secondary/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Add Money Requests Table */}
            {(activeTab === 'pending' || activeTab === 'all') && (
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">USDT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <p>No requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {request.user.firstName} {request.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">{request.currency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">{request.currencyAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-emerald-500">{request.totalAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(request.id)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>

                          {request.status === 'PENDING' && !request.bankDetailsSentAt && (
                            <button
                              onClick={() => handleSendBankDetails(request.id)}
                              className="h-8 w-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                              title="Send Bank Details"
                              disabled={actionLoading}
                            >
                              <Send className="w-4 h-4 text-violet-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}

            {/* Withdrawals Table */}
            {activeTab === 'withdrawals' && (
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount (USDT)</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!withdrawals || withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 opacity-20" />
                          <p>No pending withdrawals</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {withdrawal.user.firstName} {withdrawal.user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">{withdrawal.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-emerald-500">{withdrawal.amount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-foreground">{withdrawal.method}</span>
                        </td>
                        <td className="px-6 py-4">
                          {withdrawal.bankDetails && (
                            <div className="text-xs text-muted-foreground">
                              <div>{withdrawal.bankDetails.accountName}</div>
                              <div>{withdrawal.bankDetails.bankName}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewWithdrawal(withdrawal)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, (filters.page || 1) + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal && !!selectedRequest}
        onClose={() => setShowDetailsModal(false)}
        title="Request Details"
        maxWidth="2xl"
      >
        {selectedRequest && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* User Info */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">User Information</h3>
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.user.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referral Code</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.user.referralCode}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.currencyAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">USDT Amount</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.usdtAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bonus</p>
                  <p className="text-sm font-medium text-emerald-500">{selectedRequest.bonusAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total USDT</p>
                  <p className="text-sm font-bold text-emerald-500">{selectedRequest.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Exchange Rate</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.exchangeRate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="text-sm font-medium text-foreground">{selectedRequest.method}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
            </div>

            {/* Payment Proof */}
            {selectedRequest.paymentProof && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Payment Proof</h3>
                <div className="rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={selectedRequest.paymentProof}
                    alt="Payment Proof"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}

            {/* Transaction Reference */}
            {selectedRequest.transactionRef && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Transaction Reference</h3>
                <p className="text-sm bg-secondary/30 p-3 rounded-lg font-mono text-foreground border border-white/5">{selectedRequest.transactionRef}</p>
              </div>
            )}

            {/* Notes */}
            {selectedRequest.userNotes && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">User Notes</h3>
                <p className="text-sm bg-secondary/30 p-3 rounded-lg text-foreground border border-white/5">{selectedRequest.userNotes}</p>
              </div>
            )}

            {selectedRequest.adminNotes && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Admin Notes</h3>
                <p className="text-sm bg-blue-500/10 text-blue-200 p-3 rounded-lg border border-blue-500/20">{selectedRequest.adminNotes}</p>
              </div>
            )}

            {selectedRequest.rejectionReason && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Rejection Reason</h3>
                <p className="text-sm bg-red-500/10 text-red-200 p-3 rounded-lg border border-red-500/20">{selectedRequest.rejectionReason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              {/* Send Bank Details - Only for PENDING without bank details sent */}
              {selectedRequest.status === 'PENDING' && !selectedRequest.bankDetailsSentAt && (
                <Button
                  onClick={() => handleSendBankDetails(selectedRequest.id)}
                  disabled={actionLoading}
                  className="flex-1"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Bank Details
                </Button>
              )}

              {/* Verify/Reject - Only for PROCESSING with payment proof */}
              {selectedRequest.status === 'PROCESSING' && selectedRequest.paymentProof && (
                <>
                  <Button
                    onClick={() => setShowVerifyModal(true)}
                    disabled={actionLoading}
                    variant="primary"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Verify & Approve
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    variant="destructive"
                    className="flex-1"
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify & Approve Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to verify this request? This will credit <span className="text-emerald-500 font-bold">{selectedRequest?.totalAmount} USDT</span> to the user's wallet.
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add admin notes (optional)"
            className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
            rows={4}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowVerifyModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={actionLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              isLoading={actionLoading}
            >
              Verify & Credit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this request. The user will be notified.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason (required)"
            className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-foreground placeholder:text-muted-foreground"
            rows={4}
            required
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="flex-1"
              isLoading={actionLoading}
            >
              Reject Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawalModal && !!selectedWithdrawal}
        onClose={() => setShowWithdrawalModal(false)}
        title={`Withdrawal Request - ${selectedWithdrawal?.user.firstName} ${selectedWithdrawal?.user.lastName}`}
      >
        {selectedWithdrawal && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* User Info */}
            <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-3">User Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 text-foreground">{selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 text-foreground">{selectedWithdrawal.user.email}</span>
                </div>
              </div>
            </div>

            {/* Withdrawal Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount (USDT):</span>
                <span className="font-semibold text-emerald-500">{selectedWithdrawal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="text-foreground">{selectedWithdrawal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Bank Details */}
            {selectedWithdrawal.bankDetails && (
              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Bank Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="text-foreground">{selectedWithdrawal.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="text-foreground">{selectedWithdrawal.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="text-foreground font-mono">{selectedWithdrawal.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="text-foreground font-mono">{selectedWithdrawal.bankDetails.ifscCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* User Notes */}
            {selectedWithdrawal.userNotes && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">User Notes</h3>
                <p className="text-sm bg-secondary/30 p-3 rounded-lg text-muted-foreground">{selectedWithdrawal.userNotes}</p>
              </div>
            )}

            {/* Process Form */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Transaction Reference (UTR)</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR123456789012"
                  className="w-full px-3 py-2 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Admin Notes</label>
                <textarea
                  value={withdrawalAdminNotes}
                  onChange={(e) => setWithdrawalAdminNotes(e.target.value)}
                  placeholder="Payment sent via NEFT..."
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectWithdrawal}
                disabled={actionLoading}
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessWithdrawal}
                disabled={actionLoading || !transactionRef.trim()}
                className="flex-1"
                isLoading={actionLoading}
              >
                Process & Pay
              </Button>
            </div>
          </div>
        )}
      </Modal>


      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
