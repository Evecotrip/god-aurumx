'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  LogOut,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  X
} from 'lucide-react';
import { getTokenFromCookies, removeTokenFromCookies } from '@/api/token-user-api';
import {
  getAllUsers,
  getUserStats,
  type User,
  type UserFilters,
  type UserStatsData
} from '@/api/god-admin-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    status: '',
    search: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [showStatsModal, setShowStatsModal] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;

    setLoading(true);
    const response = await getAllUsers(token, filters);
    
    if (response.success && response.data) {
      setUsers(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } else {
      setError(response.message || 'Failed to fetch users');
    }
    setLoading(false);
  };

  const fetchUserStats = async (userId: string) => {
    if (!token) return;

    setStatsLoading(true);
    const response = await getUserStats(token, userId);
    
    if (response.success && response.data) {
      setUserStats(response.data);
      setShowStatsModal(true);
    } else {
      setError(response.message || 'Failed to fetch user stats');
    }
    setStatsLoading(false);
  };

  useEffect(() => {
    const initializeToken = async () => {
      try {
        const storedToken = getTokenFromCookies();
        if (storedToken) {
          setToken(storedToken);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Token initialization error:', error);
        router.push('/login');
      }
    };

    if (user) {
      initializeToken();
    }
  }, [user, router]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!token) return;

    fetchUsers();
  }, [isLoaded, user, token, filters]);

  const handleLogout = async () => {
    try {
      removeTokenFromCookies();
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const handleViewStats = async (user: User) => {
    setSelectedUser(user);
    await fetchUserStats(user.id);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      SUSPENDED: 'destructive',
      PENDING: 'warning',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const KYCBadge = ({ status }: { status: string }) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
      APPROVED: 'success',
      PENDING: 'warning',
      REJECTED: 'destructive',
      NOT_SUBMITTED: 'secondary',
      EXPIRED: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="text-xs">
        {status.replace('_', ' ')}
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
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">User Management</h1>
                <p className="text-xs text-muted-foreground">Manage and view all users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="border-white/5 bg-card/50">
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 bg-secondary/50 border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-secondary/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>

                <select
                  value={filters.limit?.toString()}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                  className="h-10 px-3 rounded-lg bg-secondary/50 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Wallet</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Referral</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !users || users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 opacity-20" />
                        <p>No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs text-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <KYCBadge status={user.kycStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-emerald-500">
                            ₹{parseFloat(user.wallet.totalBalance).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Invested: ₹{parseFloat(user.wallet.investedAmount).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-foreground">{user.referralCode}</div>
                          {user.referredBy && (
                            <div className="text-xs text-muted-foreground">
                              By: {user.referredBy.firstName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStats(user)}
                          disabled={statsLoading}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Stats
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-foreground px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* User Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => {
          setShowStatsModal(false);
          setUserStats(null);
          setSelectedUser(null);
        }}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} - Statistics` : 'User Statistics'}
        maxWidth="4xl"
      >
        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : userStats ? (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card gradient>
                <CardHeader className="pb-2">
                  <CardDescription>Email</CardDescription>
                  <CardTitle className="text-lg">{userStats.user.email}</CardTitle>
                </CardHeader>
              </Card>
              <Card gradient>
                <CardHeader className="pb-2">
                  <CardDescription>Phone</CardDescription>
                  <CardTitle className="text-lg">{userStats.user.phone || 'Not provided'}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Wallet Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Wallet Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Balance</CardDescription>
                    <CardTitle className="text-xl text-emerald-500">
                      ₹{parseFloat(userStats.wallet.totalBalance).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Available</CardDescription>
                    <CardTitle className="text-xl text-blue-500">
                      ₹{parseFloat(userStats.wallet.availableBalance).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Locked</CardDescription>
                    <CardTitle className="text-xl text-amber-500">
                      ₹{parseFloat(userStats.wallet.lockedBalance).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Earnings</CardDescription>
                    <CardTitle className="text-xl text-violet-500">
                      ₹{parseFloat(userStats.wallet.totalEarnings).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Investment Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Investment Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Investments</CardDescription>
                    <CardTitle className="text-2xl">{userStats.investments.total}</CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Active</CardDescription>
                    <CardTitle className="text-2xl text-emerald-500">{userStats.investments.active}</CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Matured</CardDescription>
                    <CardTitle className="text-2xl text-blue-500">{userStats.investments.matured}</CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Invested</CardDescription>
                    <CardTitle className="text-xl text-violet-500">
                      ₹{parseFloat(userStats.investments.totalInvested).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {userStats.investments.recent.length > 0 && (
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3">Recent Investments</h4>
                  <div className="space-y-2">
                    {userStats.investments.recent.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                        <div>
                          <div className="font-medium">{inv.profile}</div>
                          <div className="text-xs text-muted-foreground">{inv.referenceId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-emerald-500">₹{parseFloat(inv.amount).toLocaleString()}</div>
                          <Badge variant={inv.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs">
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Transaction Activity
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Transactions</CardDescription>
                    <CardTitle className="text-2xl">{userStats.transactions.total}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {userStats.transactions.recent.length > 0 && (
                <div className="bg-secondary/30 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Recent Transactions</h4>
                  <div className="space-y-2">
                    {userStats.transactions.recent.slice(0, 5).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                        <div className="flex-1">
                          <div className="font-medium">{txn.type}</div>
                          <div className="text-xs text-muted-foreground">{txn.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-emerald-500">₹{parseFloat(txn.amount).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hierarchy Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Referral Network
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Direct Referrals</CardDescription>
                    <CardTitle className="text-2xl">{userStats.hierarchy.directReferrals}</CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Downline</CardDescription>
                    <CardTitle className="text-2xl">{userStats.hierarchy.totalDownline}</CardTitle>
                  </CardHeader>
                </Card>
                <Card gradient>
                  <CardHeader className="pb-2">
                    <CardDescription>Max Depth</CardDescription>
                    <CardTitle className="text-2xl">{userStats.hierarchy.maxDepth}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Withdrawal & Add Money Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                  Withdrawals
                </h3>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{userStats.withdrawals.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">₹{parseFloat(userStats.withdrawals.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-semibold text-amber-500">{userStats.withdrawals.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-semibold text-emerald-500">{userStats.withdrawals.completed}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  Add Money Requests
                </h3>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{userStats.addMoneyRequests.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">₹{parseFloat(userStats.addMoneyRequests.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-semibold text-amber-500">{userStats.addMoneyRequests.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-semibold text-emerald-500">{userStats.addMoneyRequests.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <X className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
