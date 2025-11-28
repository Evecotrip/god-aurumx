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
  DollarSign,
  Building2,
  CreditCard,
  QrCode,
  Globe,
  Clock,
  Info
} from 'lucide-react';
import { getTokenFromCookies } from '@/api/token-user-api';
import {
  getAllCurrencyBanks,
  getCurrencyBankByCurrency,
  createCurrencyBank,
  updateCurrencyBank,
  uploadQRCode,
  deactivateCurrencyBank,
  permanentlyDeleteCurrencyBank,
  type CurrencyBankAccount,
  type BankAccount,
  type CreateCurrencyBankPayload,
  type UpdateCurrencyBankPayload
} from '@/api/currency-bank-api';

export default function CurrencySettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [token, setToken] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyBankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyBankAccount | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');
  
  // Form state
  const [formData, setFormData] = useState<CreateCurrencyBankPayload>({
    currency: '',
    currencyName: '',
    currencySymbol: '',
    bankAccounts: [
      {
        accountName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        upiId: ''
      }
    ],
    qrCodeUrl: '',
    qrCodeProvider: '',
    instructions: '',
    minAmount: 100,
    maxAmount: 500000,
    countryCode: '',
    processingTime: '',
    isActive: true,
    priority: 1
  });
  
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadingQR, setUploadingQR] = useState(false);

  // Get token on client side
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
    
    if (user) {
      initializeToken();
    }
  }, [user]);

  // Fetch currencies
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!token) return;

    fetchCurrencies();
  }, [isLoaded, user, token, router]);

  const fetchCurrencies = async () => {
    if (!token) return;
    
    setLoading(true);
    const response = await getAllCurrencyBanks(token);
    
    if (response.success && response.data) {
      setCurrencies(response.data);
    } else {
      setError(response.message || 'Failed to fetch currencies');
    }
    setLoading(false);
  };

  const handleCreateCurrency = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const response = await createCurrencyBank(token, formData);
    
    if (response.success) {
      setSuccess('Currency bank account created successfully');
      setShowCreateModal(false);
      fetchCurrencies();
      resetForm();
    } else {
      setError(response.message || 'Failed to create currency');
    }
    
    setLoading(false);
  };

  const handleUpdateCurrency = async () => {
    if (!token || !selectedCurrency) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const updatePayload: UpdateCurrencyBankPayload = {
      bankAccounts: formData.bankAccounts,
      instructions: formData.instructions,
      processingTime: formData.processingTime,
      qrCodeProvider: formData.qrCodeProvider,
      minAmount: formData.minAmount,
      maxAmount: formData.maxAmount,
      isActive: formData.isActive,
      priority: formData.priority
    };
    
    const response = await updateCurrencyBank(token, selectedCurrency.currency, updatePayload);
    
    if (response.success) {
      setSuccess('Currency bank account updated successfully');
      setShowEditModal(false);
      fetchCurrencies();
      resetForm();
    } else {
      setError(response.message || 'Failed to update currency');
    }
    
    setLoading(false);
  };

  const handleUploadQR = async (currency: string) => {
    if (!token || !qrFile) return;
    
    setUploadingQR(true);
    setError('');
    setSuccess('');
    
    const response = await uploadQRCode(token, currency, qrFile);
    
    if (response.success) {
      setSuccess('QR code uploaded successfully');
      fetchCurrencies();
      setQrFile(null);
    } else {
      setError(response.message || 'Failed to upload QR code');
    }
    
    setUploadingQR(false);
  };

  const handleDelete = async () => {
    if (!token || !selectedCurrency) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const response = deleteType === 'permanent'
      ? await permanentlyDeleteCurrencyBank(token, selectedCurrency.currency)
      : await deactivateCurrencyBank(token, selectedCurrency.currency);
    
    if (response.success) {
      setSuccess(deleteType === 'permanent' 
        ? 'Currency permanently deleted' 
        : 'Currency deactivated successfully');
      setShowDeleteConfirm(false);
      fetchCurrencies();
    } else {
      setError(response.message || 'Failed to delete currency');
    }
    
    setLoading(false);
  };

  const openEditModal = (currency: CurrencyBankAccount) => {
    setSelectedCurrency(currency);
    setFormData({
      currency: currency.currency,
      currencyName: currency.currencyName,
      currencySymbol: currency.currencySymbol,
      bankAccounts: currency.bankAccounts,
      qrCodeUrl: currency.qrCodeUrl,
      qrCodeProvider: currency.qrCodeProvider,
      instructions: currency.instructions,
      minAmount: parseInt(currency.minAmount),
      maxAmount: parseInt(currency.maxAmount),
      countryCode: currency.countryCode,
      processingTime: currency.processingTime,
      isActive: currency.isActive,
      priority: currency.priority
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      currency: '',
      currencyName: '',
      currencySymbol: '',
      bankAccounts: [{
        accountName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        upiId: ''
      }],
      qrCodeUrl: '',
      qrCodeProvider: '',
      instructions: '',
      minAmount: 100,
      maxAmount: 500000,
      countryCode: '',
      processingTime: '',
      isActive: true,
      priority: 1
    });
    setSelectedCurrency(null);
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bankAccounts: [
        ...formData.bankAccounts,
        {
          accountName: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          branch: '',
          upiId: ''
        }
      ]
    });
  };

  const removeBankAccount = (index: number) => {
    setFormData({
      ...formData,
      bankAccounts: formData.bankAccounts.filter((_, i) => i !== index)
    });
  };

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    const updatedAccounts = [...formData.bankAccounts];
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      [field]: value
    };
    setFormData({
      ...formData,
      bankAccounts: updatedAccounts
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Currency Settings</h1>
                  <p className="text-sm text-gray-600">Manage currency bank accounts</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Currency
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Currency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {currency.currencySymbol} {currency.currency}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      currency.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{currency.currencyName}</p>
                </div>
                <Globe className="w-6 h-6 text-gray-400" />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{currency.bankAccounts.length} Bank Account(s)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {currency.currencySymbol}{currency.minAmount} - {currency.currencySymbol}{currency.maxAmount}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{currency.processingTime}</span>
                </div>
                {currency.qrCodeUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{currency.qrCodeProvider}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(currency)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedCurrency(currency);
                    setDeleteType('soft');
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {currencies.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No currencies configured</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first currency bank account</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Currency
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Currency Bank Account</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Code</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    placeholder="INR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Name</label>
                  <input
                    type="text"
                    value={formData.currencyName}
                    onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
                    placeholder="Indian Rupee"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                    placeholder="₹"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bank Accounts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Bank Accounts</label>
                  <button
                    onClick={addBankAccount}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Account
                  </button>
                </div>

                {formData.bankAccounts.map((account, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Account {index + 1}</h4>
                      {formData.bankAccounts.length > 1 && (
                        <button
                          onClick={() => removeBankAccount(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={account.accountName}
                        onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                        placeholder="Account Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                        placeholder="Bank Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                        placeholder="Account Number"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.ifscCode}
                        onChange={(e) => updateBankAccount(index, 'ifscCode', e.target.value)}
                        placeholder="IFSC Code"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.branch}
                        onChange={(e) => updateBankAccount(index, 'branch', e.target.value)}
                        placeholder="Branch"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.upiId}
                        onChange={(e) => updateBankAccount(index, 'upiId', e.target.value)}
                        placeholder="UPI ID"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* QR Code & Provider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code URL</label>
                  <input
                    type="text"
                    value={formData.qrCodeUrl}
                    onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Provider</label>
                  <input
                    type="text"
                    value={formData.qrCodeProvider}
                    onChange={(e) => setFormData({ ...formData, qrCodeProvider: e.target.value })}
                    placeholder="PhonePe, PayPay, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Payment instructions for users..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amounts & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
                  <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                    placeholder="IN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time</label>
                  <input
                    type="text"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    placeholder="Instant to 1 hour"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Priority & Active */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCurrency}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCurrency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit {selectedCurrency.currency}</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Upload QR Code */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload New QR Code</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm"
                  />
                  <button
                    onClick={() => handleUploadQR(selectedCurrency.currency)}
                    disabled={!qrFile || uploadingQR}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </button>
                </div>
                {selectedCurrency.qrCodeUrl && (
                  <div className="mt-3">
                    <img src={selectedCurrency.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain border border-gray-200 rounded" />
                  </div>
                )}
              </div>

              {/* Bank Accounts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Bank Accounts</label>
                  <button
                    onClick={addBankAccount}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Account
                  </button>
                </div>

                {formData.bankAccounts.map((account, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Account {index + 1}</h4>
                      {formData.bankAccounts.length > 1 && (
                        <button
                          onClick={() => removeBankAccount(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={account.accountName}
                        onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                        placeholder="Account Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                        placeholder="Bank Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                        placeholder="Account Number"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.ifscCode}
                        onChange={(e) => updateBankAccount(index, 'ifscCode', e.target.value)}
                        placeholder="IFSC Code"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.branch}
                        onChange={(e) => updateBankAccount(index, 'branch', e.target.value)}
                        placeholder="Branch"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={account.upiId}
                        onChange={(e) => updateBankAccount(index, 'upiId', e.target.value)}
                        placeholder="UPI ID"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* QR Provider & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Provider</label>
                  <input
                    type="text"
                    value={formData.qrCodeProvider}
                    onChange={(e) => setFormData({ ...formData, qrCodeProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Time</label>
                  <input
                    type="text"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amounts & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCurrency}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCurrency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Currency</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete {selectedCurrency.currency}?</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="radio"
                  checked={deleteType === 'soft'}
                  onChange={() => setDeleteType('soft')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Deactivate (can be restored)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={deleteType === 'permanent'}
                  onChange={() => setDeleteType('permanent')}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-700">Permanently delete (cannot be undone)</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteType === 'permanent' ? 'Delete Forever' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
