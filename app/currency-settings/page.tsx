'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  CreditCard,
  QrCode,
  Clock,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react';
import { getTokenFromCookies } from '@/api/token-user-api';
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  uploadBankQRCode,
  deactivateBankAccount,
  setDailyProfitRate,
  getDailyRateStatus,
  type BankAccount,
  type CreateBankAccountPayload,
  type UpdateBankAccountPayload,
  type DailyRateStatus,
  type SetDailyRatePayload
} from '@/api/currency-bank-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'rates'>('bank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bank Account States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Daily Rate States
  const [rateStatus, setRateStatus] = useState<DailyRateStatus | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);

  // Bank Account Form
  const [bankFormData, setBankFormData] = useState<CreateBankAccountPayload>({
    accountName: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    qrCodeProvider: '',
    instructions: '',
    accountType: 'CURRENT',
    minAmount: 100,
    maxAmount: 100000,
    processingTime: 'Instant - 30 minutes',
    isActive: true,
    isPrimary: false,
    displayOrder: 1
  });

  // Daily Rate Form
  const [rateFormData, setRateFormData] = useState<SetDailyRatePayload>({
    date: new Date().toISOString().split('T')[0],
    bronzeRate: 5,
    silverRate: 8,
    goldRate: 10,
    diamondRate: 15,
    notes: ''
  });

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadingQR, setUploadingQR] = useState(false);

  useEffect(() => {
    const initializeToken = async () => {
      let authToken = getTokenFromCookies();
      if (!authToken && user?.id) {
        const { generateToken: genToken, storeTokenInCookies: storeToken } = await import('@/api/token-user-api');
        const tokenResponse = await genToken(user.id);
        if (tokenResponse.success && tokenResponse.data?.token) {
          authToken = tokenResponse.data.token;
          storeToken(authToken);
        }
      }
      setToken(authToken);
    };
    if (user) initializeToken();
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    if (!token) return;
    fetchBankAccounts();
    fetchRateStatus();
  }, [isLoaded, user, token, router]);

  const fetchBankAccounts = async () => {
    if (!token) return;
    setLoading(true);
    const response = await getAllBankAccounts(token);
    if (response.success && response.data) {
      setBankAccounts(response.data);
    } else {
      setError(response.message || 'Failed to fetch bank accounts');
    }
    setLoading(false);
  };

  const fetchRateStatus = async () => {
    if (!token) return;
    const response = await getDailyRateStatus(token);
    if (response.success && response.data) {
      setRateStatus(response.data);
    }
  };

  const handleCreateBankAccount = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const response = await createBankAccount(token, bankFormData);
    if (response.success) {
      setSuccess('Bank account created successfully');
      setShowCreateModal(false);
      fetchBankAccounts();
      resetBankForm();
    } else {
      setError(response.message || 'Failed to create bank account');
    }
    setLoading(false);
  };

  const handleUpdateBankAccount = async () => {
    if (!token || !selectedAccount) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const updatePayload: UpdateBankAccountPayload = { ...bankFormData };
    const response = await updateBankAccount(token, selectedAccount.id, updatePayload);
    if (response.success) {
      setSuccess('Bank account updated successfully');
      setShowEditModal(false);
      fetchBankAccounts();
      resetBankForm();
    } else {
      setError(response.message || 'Failed to update bank account');
    }
    setLoading(false);
  };

  const handleUploadQR = async (accountId: string) => {
    if (!token || !qrFile) return;
    setUploadingQR(true);
    setError('');
    const response = await uploadBankQRCode(token, accountId, qrFile);
    if (response.success) {
      setSuccess('QR code uploaded successfully');
      fetchBankAccounts();
      setQrFile(null);
    } else {
      setError(response.message || 'Failed to upload QR code');
    }
    setUploadingQR(false);
  };

  const handleDeleteBankAccount = async () => {
    if (!token || !selectedAccount) return;
    setLoading(true);
    setError('');
    const response = await deactivateBankAccount(token, selectedAccount.id);
    if (response.success) {
      setSuccess('Bank account deactivated successfully');
      setShowDeleteConfirm(false);
      fetchBankAccounts();
    } else {
      setError(response.message || 'Failed to deactivate bank account');
    }
    setLoading(false);
  };

  const handleSetDailyRate = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    const response = await setDailyProfitRate(token, rateFormData);
    if (response.success) {
      setSuccess('Daily profit rate set successfully');
      setShowRateModal(false);
      fetchRateStatus();
    } else {
      setError(response.message || 'Failed to set daily rate');
    }
    setLoading(false);
  };

  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setBankFormData({
      accountName: account.accountName,
      accountHolder: account.accountHolder,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      ifscCode: account.ifscCode,
      branch: account.branch,
      upiId: account.upiId || '',
      qrCodeProvider: account.qrCodeProvider || '',
      instructions: account.instructions,
      accountType: account.accountType,
      minAmount: parseInt(account.minAmount),
      maxAmount: parseInt(account.maxAmount),
      processingTime: account.processingTime,
      isActive: account.isActive,
      isPrimary: account.isPrimary,
      displayOrder: account.displayOrder
    });
    setShowEditModal(true);
  };

  const resetBankForm = () => {
    setBankFormData({
      accountName: '', accountHolder: '', bankName: '', accountNumber: '',
      ifscCode: '', branch: '', upiId: '', qrCodeProvider: '', instructions: '',
      accountType: 'CURRENT', minAmount: 100, maxAmount: 100000,
      processingTime: 'Instant - 30 minutes', isActive: true, isPrimary: false, displayOrder: 1
    });
    setSelectedAccount(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="h-10 w-10 p-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
                  <p className="text-xs text-muted-foreground">Manage bank accounts & daily rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-destructive" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-500">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4 text-emerald-500" /></button>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <Button variant={activeTab === 'bank' ? 'primary' : 'outline'} onClick={() => setActiveTab('bank')} leftIcon={<Building2 className="w-4 h-4" />}>
            Bank Accounts
          </Button>
          <Button variant={activeTab === 'rates' ? 'primary' : 'outline'} onClick={() => setActiveTab('rates')} leftIcon={<TrendingUp className="w-4 h-4" />}>
            Daily Profit Rates
          </Button>
        </div>

        {activeTab === 'bank' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Bank Accounts</h2>
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Add Bank Account</Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAccounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{account.accountName}</CardTitle>
                            {account.isPrimary && <Badge variant="default">Primary</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{account.bankName}</p>
                        </div>
                        <Badge variant={account.isActive ? 'success' : 'secondary'}>{account.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-mono">{account.accountNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{account.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{account.processingTime}</span>
                      </div>
                      {account.qrCodeUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <QrCode className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{account.qrCodeProvider || 'QR Available'}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">₹{account.minAmount} - ₹{account.maxAmount}</div>
                      <div className="flex gap-2 pt-3">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(account)} leftIcon={<Edit className="w-4 h-4" />} className="flex-1">Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => { setSelectedAccount(account); setShowDeleteConfirm(true); }} leftIcon={<Trash2 className="w-4 h-4" />} className="flex-1">Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {bankAccounts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No bank accounts configured</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first bank account</p>
                <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Add Bank Account</Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'rates' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Daily Profit Rates</h2>
              <Button onClick={() => setShowRateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Set Today&apos;s Rate</Button>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Today&apos;s Rate Status</CardTitle>
                  {rateStatus && <Badge variant={rateStatus.isSetForToday ? 'success' : 'warning'}>{rateStatus.isSetForToday ? 'Set for Today' : 'Using Fallback'}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {rateStatus?.todayRate ? (
                  <div className="space-y-4">
                    {rateStatus.fallbackUsed && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-500">
                        Using fallback rate from {new Date(rateStatus.todayRate.date).toLocaleDateString()}
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-500">{rateStatus.todayRate.bronzeRate}%</div>
                        <div className="text-sm text-muted-foreground">Bronze</div>
                      </div>
                      <div className="bg-slate-400/20 border border-slate-400/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-slate-300">{rateStatus.todayRate.silverRate}%</div>
                        <div className="text-sm text-muted-foreground">Silver</div>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-500">{rateStatus.todayRate.goldRate}%</div>
                        <div className="text-sm text-muted-foreground">Gold</div>
                      </div>
                      <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-cyan-400">{rateStatus.todayRate.diamondRate}%</div>
                        <div className="text-sm text-muted-foreground">Diamond</div>
                      </div>
                    </div>
                    {rateStatus.todayRate.notes && <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {rateStatus.todayRate.notes}</p>}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground">No rate set yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Create Bank Account Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetBankForm(); }} title="Add Bank Account" maxWidth="2xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Account Name" value={bankFormData.accountName} onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })} placeholder="Primary Account" />
            <Input label="Account Holder" value={bankFormData.accountHolder} onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value })} placeholder="Company Name Pvt Ltd" />
            <Input label="Bank Name" value={bankFormData.bankName} onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })} placeholder="HDFC Bank" />
            <Input label="Account Number" value={bankFormData.accountNumber} onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} placeholder="50200012345678" />
            <Input label="IFSC Code" value={bankFormData.ifscCode} onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value.toUpperCase() })} placeholder="HDFC0001234" />
            <Input label="Branch" value={bankFormData.branch} onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })} placeholder="Mumbai Main Branch" />
            <Input label="UPI ID" value={bankFormData.upiId} onChange={(e) => setBankFormData({ ...bankFormData, upiId: e.target.value })} placeholder="company@hdfc" />
            <Input label="QR Code Provider" value={bankFormData.qrCodeProvider} onChange={(e) => setBankFormData({ ...bankFormData, qrCodeProvider: e.target.value })} placeholder="Paytm, PhonePe" />
            <Input label="Min Amount" type="number" value={bankFormData.minAmount} onChange={(e) => setBankFormData({ ...bankFormData, minAmount: parseInt(e.target.value) || 0 })} />
            <Input label="Max Amount" type="number" value={bankFormData.maxAmount} onChange={(e) => setBankFormData({ ...bankFormData, maxAmount: parseInt(e.target.value) || 0 })} />
            <Input label="Processing Time" value={bankFormData.processingTime} onChange={(e) => setBankFormData({ ...bankFormData, processingTime: e.target.value })} placeholder="Instant - 30 minutes" />
            <Input label="Display Order" type="number" value={bankFormData.displayOrder} onChange={(e) => setBankFormData({ ...bankFormData, displayOrder: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Instructions</label>
            <textarea value={bankFormData.instructions} onChange={(e) => setBankFormData({ ...bankFormData, instructions: e.target.value })} placeholder="Payment instructions..." rows={3} className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bankFormData.isActive} onChange={(e) => setBankFormData({ ...bankFormData, isActive: e.target.checked })} className="w-4 h-4 text-primary rounded" />
              <span className="text-sm font-medium text-foreground">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bankFormData.isPrimary} onChange={(e) => setBankFormData({ ...bankFormData, isPrimary: e.target.checked })} className="w-4 h-4 text-primary rounded" />
              <span className="text-sm font-medium text-foreground">Primary Account</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => { setShowCreateModal(false); resetBankForm(); }}>Cancel</Button>
          <Button onClick={handleCreateBankAccount} disabled={loading} isLoading={loading} leftIcon={!loading ? <Save className="w-4 h-4" /> : undefined}>Create Account</Button>
        </div>
      </Modal>

      {/* Edit Bank Account Modal */}
      <Modal isOpen={showEditModal && !!selectedAccount} onClose={() => { setShowEditModal(false); resetBankForm(); }} title={`Edit ${selectedAccount?.accountName}`} maxWidth="2xl">
        {selectedAccount && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <label className="block text-sm font-medium text-foreground mb-2">Upload New QR Code</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files?.[0] || null)} className="flex-1 text-sm text-foreground" />
                <Button onClick={() => handleUploadQR(selectedAccount.id)} disabled={!qrFile || uploadingQR} isLoading={uploadingQR} leftIcon={!uploadingQR ? <Upload className="w-4 h-4" /> : undefined}>Upload</Button>
              </div>
              {selectedAccount.qrCodeUrl && <div className="mt-3"><img src={selectedAccount.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain border border-white/10 rounded" /></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Account Name" value={bankFormData.accountName} onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })} />
              <Input label="Account Holder" value={bankFormData.accountHolder} onChange={(e) => setBankFormData({ ...bankFormData, accountHolder: e.target.value })} />
              <Input label="Bank Name" value={bankFormData.bankName} onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })} />
              <Input label="Account Number" value={bankFormData.accountNumber} onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })} />
              <Input label="IFSC Code" value={bankFormData.ifscCode} onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value.toUpperCase() })} />
              <Input label="Branch" value={bankFormData.branch} onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })} />
              <Input label="UPI ID" value={bankFormData.upiId} onChange={(e) => setBankFormData({ ...bankFormData, upiId: e.target.value })} />
              <Input label="QR Code Provider" value={bankFormData.qrCodeProvider} onChange={(e) => setBankFormData({ ...bankFormData, qrCodeProvider: e.target.value })} />
              <Input label="Min Amount" type="number" value={bankFormData.minAmount} onChange={(e) => setBankFormData({ ...bankFormData, minAmount: parseInt(e.target.value) || 0 })} />
              <Input label="Max Amount" type="number" value={bankFormData.maxAmount} onChange={(e) => setBankFormData({ ...bankFormData, maxAmount: parseInt(e.target.value) || 0 })} />
              <Input label="Processing Time" value={bankFormData.processingTime} onChange={(e) => setBankFormData({ ...bankFormData, processingTime: e.target.value })} />
              <Input label="Display Order" type="number" value={bankFormData.displayOrder} onChange={(e) => setBankFormData({ ...bankFormData, displayOrder: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Instructions</label>
              <textarea value={bankFormData.instructions} onChange={(e) => setBankFormData({ ...bankFormData, instructions: e.target.value })} rows={3} className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={bankFormData.isActive} onChange={(e) => setBankFormData({ ...bankFormData, isActive: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-medium text-foreground">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={bankFormData.isPrimary} onChange={(e) => setBankFormData({ ...bankFormData, isPrimary: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm font-medium text-foreground">Primary Account</span>
              </label>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => { setShowEditModal(false); resetBankForm(); }}>Cancel</Button>
          <Button onClick={handleUpdateBankAccount} disabled={loading} isLoading={loading} leftIcon={!loading ? <Save className="w-4 h-4" /> : undefined}>Update Account</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm && !!selectedAccount} onClose={() => setShowDeleteConfirm(false)} title="Delete Bank Account" maxWidth="md">
        {selectedAccount && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedAccount.accountName}</p>
                <p className="text-sm text-muted-foreground">Are you sure you want to deactivate this bank account?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteBankAccount} disabled={loading} isLoading={loading}>Deactivate</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Set Daily Rate Modal */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Set Daily Profit Rate" maxWidth="lg">
        <div className="space-y-4">
          <Input label="Date" type="date" value={rateFormData.date} onChange={(e) => setRateFormData({ ...rateFormData, date: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-500 mb-2">Bronze (%)</label>
              <Input type="number" value={rateFormData.bronzeRate} onChange={(e) => setRateFormData({ ...rateFormData, bronzeRate: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Silver (%)</label>
              <Input type="number" value={rateFormData.silverRate} onChange={(e) => setRateFormData({ ...rateFormData, silverRate: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-2">Gold (%)</label>
              <Input type="number" value={rateFormData.goldRate} onChange={(e) => setRateFormData({ ...rateFormData, goldRate: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Diamond (%)</label>
              <Input type="number" value={rateFormData.diamondRate} onChange={(e) => setRateFormData({ ...rateFormData, diamondRate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Notes (Optional)</label>
            <textarea value={rateFormData.notes} onChange={(e) => setRateFormData({ ...rateFormData, notes: e.target.value })} placeholder="Any notes about today's rates..." rows={2} className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => setShowRateModal(false)}>Cancel</Button>
          <Button onClick={handleSetDailyRate} disabled={loading} isLoading={loading} leftIcon={!loading ? <Save className="w-4 h-4" /> : undefined}>Set Rate</Button>
        </div>
      </Modal>
    </div>
  );
}
