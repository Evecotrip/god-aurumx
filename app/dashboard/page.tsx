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
  Calendar
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
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending');
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
        ? { ...filters, status: 'PENDING' }
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
    fetchRequests();
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

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Master Node Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.firstName}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/currency-settings')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Currency Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats ? stats.pending : '0'}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats ? stats.processing : '0'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats ? stats.completed : '0'}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total USDT</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats ? stats.totalUsdtCredited : '0.00'}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Pending Requests
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Requests
                </button>
              </div>

              <div className="flex gap-3">
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters({ ...filters, currency: e.target.value, page: 1 })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USDT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.user.firstName} {request.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{request.currency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{request.currencyAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">{request.totalAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(request.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {request.status === 'PENDING' && !request.bankDetailsSentAt && (
                            <button
                              onClick={() => handleSendBankDetails(request.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Send Bank Details"
                              disabled={actionLoading}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, (filters.page || 1) + 1) })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedRequest.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedRequest.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Referral Code</p>
                    <p className="text-sm font-medium">{selectedRequest.user.referralCode}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Currency</p>
                    <p className="text-sm font-medium">{selectedRequest.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-medium">{selectedRequest.currencyAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">USDT Amount</p>
                    <p className="text-sm font-medium">{selectedRequest.usdtAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bonus</p>
                    <p className="text-sm font-medium text-green-600">{selectedRequest.bonusAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total USDT</p>
                    <p className="text-sm font-bold text-green-600">{selectedRequest.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Exchange Rate</p>
                    <p className="text-sm font-medium">{selectedRequest.exchangeRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm font-medium">{selectedRequest.method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedRequest.paymentProof && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Proof</h3>
                  <img
                    src={selectedRequest.paymentProof}
                    alt="Payment Proof"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Transaction Reference */}
              {selectedRequest.transactionRef && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Transaction Reference</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg font-mono">{selectedRequest.transactionRef}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRequest.userNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">User Notes</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.userNotes}</p>
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</h3>
                  <p className="text-sm bg-blue-50 p-3 rounded-lg">{selectedRequest.adminNotes}</p>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Rejection Reason</h3>
                  <p className="text-sm bg-red-50 p-3 rounded-lg text-red-800">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {/* Send Bank Details - Only for PENDING without bank details sent */}
                {selectedRequest.status === 'PENDING' && !selectedRequest.bankDetailsSentAt && (
                  <button
                    onClick={() => handleSendBankDetails(selectedRequest.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    Send Bank Details
                  </button>
                )}
                
                {/* Verify/Reject - Only for PROCESSING with payment proof */}
                {selectedRequest.status === 'PROCESSING' && selectedRequest.paymentProof && (
                  <>
                    <button
                      onClick={() => setShowVerifyModal(true)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      Verify & Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verify & Approve Request</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Verify & Credit USDT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (required)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
