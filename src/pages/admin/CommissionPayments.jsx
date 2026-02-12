import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { commissionAPI, associatesAPI } from '../../services/api';
import { formatCurrency, formatDateTime, debounce } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FileUpload, { FilePreview } from '../../components/common/FileUpload';
import toast from 'react-hot-toast';

const CommissionPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    transactionId: '',
    screenshotUrl: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Pending'
  });
  const [formErrors, setFormErrors] = useState({});
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [summary, setSummary] = useState({ totalPendingAmount: 0, totalPaidAmount: 0, pendingCount: 0, paidCount: 0 });
  const [associateDetails, setAssociateDetails] = useState(null);
  const [loadingAssociate, setLoadingAssociate] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingCommissions();
    } else {
      fetchCompletedPayments();
    }
  }, [activeTab, pagination.page, statusFilter]);

  // Load paid summary on mount so cards show both pending and paid totals
  useEffect(() => {
    commissionAPI.getPayments({ status: 'paid', page: 1, limit: 1 })
      .then((res) => {
        const payload = res.data?.data || {};
        setSummary(prev => ({
          ...prev,
          totalPaidAmount: payload.totalPaidAmount ?? 0,
          paidCount: payload.total ?? 0
        }));
      })
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (pagination.page === 1) {
        if (activeTab === 'pending') {
          fetchPendingCommissions();
        } else {
          fetchCompletedPayments();
        }
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    debouncedSearch();
  }, [searchTerm]);

  const fetchPendingCommissions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: 'pending'
      };

      const response = await commissionAPI.getPayments(params);
      const payload = response.data?.data || {};
      const list = Array.isArray(payload.data) ? payload.data : (payload.commissions || []);
      
      setPendingCommissions(list);
      setPagination(prev => ({
        ...prev,
        total: payload.total ?? 0,
        totalPages: payload.totalPages ?? 1
      }));
      setSummary(prev => ({
        ...prev,
        totalPendingAmount: payload.totalPendingAmount ?? 0,
        pendingCount: payload.total ?? 0
      }));
    } catch {
      toast.error('Failed to load pending commissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: 'paid'
      };

      const response = await commissionAPI.getPayments(params);
      const payload = response.data?.data || {};
      const list = Array.isArray(payload.data) ? payload.data : (payload.payments || []);
      
      setPayments(list);
      setPagination(prev => ({
        ...prev,
        total: payload.total ?? 0,
        totalPages: payload.totalPages ?? 1
      }));
      setSummary(prev => ({
        ...prev,
        totalPaidAmount: payload.totalPaidAmount ?? 0,
        paidCount: payload.total ?? 0
      }));
    } catch {
      toast.error('Failed to load completed payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (formData.paymentStatus !== 'Paid') {
      setShowPaymentModal(false);
      resetForm();
      return;
    }
    if (!validateForm()) return;
    try {
      const submitData = {
        ...(selectedCommission.packageId != null && { packageId: selectedCommission.packageId }),
        ...(selectedCommission.leadId != null && { leadId: selectedCommission.leadId }),
        associateId: selectedCommission.associateId,
        amount: selectedCommission.commissionAmount,
        transactionId: formData.transactionId.trim(),
        screenshotUrl: uploadedScreenshot?.url || formData.screenshotUrl || null
      };
      await commissionAPI.recordPayment(submitData);
      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setAssociateDetails(null);
      resetForm();
      fetchPendingCommissions();
      fetchCompletedPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.paymentStatus === 'Paid' && !formData.transactionId.trim()) {
      errors.transactionId = 'Transaction ID is required when marking as Paid';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      transactionId: '',
      screenshotUrl: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Pending'
    });
    setFormErrors({});
    setUploadedScreenshot(null);
  };

  const handlePaymentClick = (commission) => {
    setSelectedCommission(commission);
    setAssociateDetails(null);
    resetForm();
    setShowPaymentModal(true);
  };

  useEffect(() => {
    if (!showPaymentModal || !selectedCommission?.associateId) return;
    let cancelled = false;
    setLoadingAssociate(true);
    associatesAPI.getById(selectedCommission.associateId)
      .then((res) => {
        if (!cancelled && res.data?.data) setAssociateDetails(res.data.data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load associate details');
      })
      .finally(() => {
        if (!cancelled) setLoadingAssociate(false);
      });
    return () => { cancelled = true; };
  }, [showPaymentModal, selectedCommission?.associateId]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Payments</h1>
          <p className="text-gray-600">Process and track commission payments to associates</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'pending') {
              fetchPendingCommissions();
            } else {
              fetchCompletedPayments();
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md bg-yellow-500 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Payments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalPendingAmount)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Paid This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalPaidAmount)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center">
                  <DocumentArrowUpIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Count
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {summary.pendingCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Payments ({summary.pendingCount})
            </button>
            <button
              onClick={() => handleTabChange('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Payments
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="commission-search"
                  name="commissionSearch"
                  type="text"
                  placeholder="Search by associate name, customer, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'pending' ? (
                // Pending Payments Table
                pendingCommissions.length === 0 ? (
                  <div className="text-center py-12">
                    <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All commission payments are up to date.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associate ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associate Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pending Commission Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Edit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingCommissions.map((commission) => (
                          <tr key={commission.packageId ?? `lead-${commission.leadId}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {commission.associateUniqueId ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {commission.associateName ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(commission.commissionAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {commission.status ?? 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handlePaymentClick(commission)}
                                className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                                title="Edit / Record payment"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // Completed Payments Table
                payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No completed payments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Completed payments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associate ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Associate Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Edit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.associateUniqueId ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.associateName ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {payment.status ?? 'Paid'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handlePaymentClick({ ...payment, commissionAmount: payment.amount, packageId: payment.packageId, associateId: payment.associateId, status: 'Paid', associateName: payment.associateName, associateUniqueId: payment.associateUniqueId })}
                                className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                                title="View details"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {[...Array(pagination.totalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit / Record Payment Modal */}
      {showPaymentModal && selectedCommission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => { setShowPaymentModal(false); setAssociateDetails(null); resetForm(); }}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleRecordPayment}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {selectedCommission.status === 'Paid' ? 'Payment & Associate Details' : 'Record Commission Payment'}
                  </h3>

                  {/* Associate details (from Users table) */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Associate Details</h4>
                    {loadingAssociate ? (
                      <div className="flex items-center text-gray-500 text-sm"><LoadingSpinner size="sm" /> Loading...</div>
                    ) : associateDetails ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div><span className="text-gray-500">ID:</span> {associateDetails.id}</div>
                        <div><span className="text-gray-500">Unique ID:</span> {associateDetails.uniqueId ?? '-'}</div>
                        <div><span className="text-gray-500">Name:</span> {associateDetails.name}</div>
                        <div><span className="text-gray-500">Email:</span> {associateDetails.email}</div>
                        <div><span className="text-gray-500">Role:</span> {associateDetails.role}</div>
                        <div><span className="text-gray-500">Phone:</span> {associateDetails.phone ?? '-'}</div>
                        <div className="sm:col-span-2"><span className="text-gray-500">Address:</span> {associateDetails.address ?? '-'}</div>
                        <div><span className="text-gray-500">Account Number:</span> {associateDetails.accountNumber ?? '-'}</div>
                        <div><span className="text-gray-500">IFSC Code:</span> {associateDetails.ifscCode ?? '-'}</div>
                        <div><span className="text-gray-500">UPI ID:</span> {associateDetails.upiId ?? '-'}</div>
                        <div><span className="text-gray-500">Active:</span> {associateDetails.isActive ? 'Yes' : 'No'}</div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Associate: {selectedCommission.associateName} ({selectedCommission.associateUniqueId})</p>
                    )}
                  </div>

                  {/* Payment section */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Payment</h4>
                    <div className="space-y-1 text-sm text-blue-900 mb-3">
                      {selectedCommission.leadId != null && selectedCommission.packageId == null && (
                        <div><strong>Lead ID:</strong> {selectedCommission.leadId} (no package yet – will be created on pay)</div>
                      )}
                      {selectedCommission.packageId != null && <div><strong>Package ID:</strong> {selectedCommission.packageId}</div>}
                      <div><strong>Associate ID:</strong> {selectedCommission.associateId}</div>
                      <div><strong>Amount:</strong> {formatCurrency(selectedCommission.commissionAmount)}</div>
                      <div><strong>Status:</strong> {selectedCommission.status ?? 'Pending'}</div>
                      {selectedCommission.status === 'Paid' && selectedCommission.transactionId && (
                        <div><strong>Transaction ID:</strong> {selectedCommission.transactionId}</div>
                      )}
                      {selectedCommission.status === 'Paid' && selectedCommission.paymentDate && (
                        <div><strong>Payment Date:</strong> {formatDateTime(selectedCommission.paymentDate)}</div>
                      )}
                      {selectedCommission.status === 'Paid' && selectedCommission.screenshotUrl && (
                        <div>
                          <a href={selectedCommission.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Screenshot</a>
                        </div>
                      )}
                    </div>

                    {selectedCommission.status !== 'Paid' && (
                      <>
                        <div className="space-y-4 pt-2 border-t border-blue-200">
                          <div>
                            <label htmlFor="payment-status" className="block text-sm font-medium text-gray-700">Payment Status</label>
                            <select
                              id="payment-status"
                              name="paymentStatus"
                              value={formData.paymentStatus ?? 'Pending'}
                              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700">Transaction ID *</label>
                            <input
                              id="transaction-id"
                              name="transactionId"
                              type="text"
                              value={formData.transactionId}
                              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                              className={`mt-1 block w-full border rounded-md shadow-sm sm:text-sm ${formErrors.transactionId ? 'border-red-300' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                              placeholder="Enter transaction/reference ID"
                            />
                            {formErrors.transactionId && <p className="mt-1 text-sm text-red-600">{formErrors.transactionId}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Screenshot (URL or upload)</label>
                            {uploadedScreenshot ? (
                              <div className="space-y-2">
                                <FilePreview file={uploadedScreenshot} onRemove={() => setUploadedScreenshot(null)} className="max-w-xs" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileUpload
                                  uploadType="commissionScreenshot"
                                  accept="image/*"
                                  maxSize={2}
                                  onUploadSuccess={(data) => { setUploadedScreenshot(data.file); toast.success('Screenshot uploaded'); }}
                                  onUploadError={() => toast.error('Upload failed')}
                                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400"
                                />
                                <input
                                  id="screenshot-url"
                                  name="screenshotUrl"
                                  type="url"
                                  value={formData.screenshotUrl}
                                  onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                  placeholder="Or paste screenshot URL"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedCommission.status !== 'Paid' && (
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {formData.paymentStatus === 'Paid' ? 'Save as Paid' : 'Save'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); setAssociateDetails(null); resetForm(); }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {selectedCommission.status === 'Paid' ? 'Close' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionPayments;