import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { commissionAPI, dashboardAPI } from '../../services/api';
import { getUserId } from '../../utils/auth';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyCommission = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'paid'
  const [summary, setSummary] = useState({
    totalCommissionEarned: 0,
    totalCommissionPaid: 0,
    pendingCommission: 0
  });
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = getUserId();

  useEffect(() => {
    fetchSummary();
    fetchCommissionData();
  }, [userId]);

  const fetchCommissionData = async () => {
    if (!userId) return;
    try {
      const response = await commissionAPI.getAssociateCommissions(userId);
      const payload = response.data?.data || response.data || {};
      const list = Array.isArray(payload.commissions) ? payload.commissions : (payload.data || []);
      setCommissions(list);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load commission data');
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await dashboardAPI.getAssociateDashboard(userId);
      const payload = response.data?.data || response.data || {};
      const summaryData = payload.summary || payload;
      setSummary({
        totalCommissionEarned: summaryData.totalCommissionEarned ?? payload.totalCommissionEarned ?? 0,
        totalCommissionPaid: summaryData.totalCommissionPaid ?? payload.totalCommissionPaid ?? 0,
        pendingCommission: summaryData.pendingCommission ?? payload.pendingCommission ?? 0
      });
    } catch {
      // Error handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (commission) => {
    setSelectedCommission(commission);
    setShowModal(true);
  };

  const getPaymentStatusIcon = (status, isPaid) => {
    if (isPaid) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status === 'Cancelled') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPaymentStatusText = (status, isPaid) => {
    if (isPaid) return 'Paid';
    if (status === 'Cancelled') return 'Cancelled';
    return 'Pending';
  };

  const getPaymentStatusColor = (status, isPaid) => {
    if (isPaid) return 'text-green-600 bg-green-100';
    if (status === 'Cancelled') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  // Filter commissions based on active tab (use isPaid or paymentStatus)
  const filteredCommissions = commissions.filter(commission => {
    const isPaid = commission.isPaid === true || commission.paymentStatus === 'Paid';
    if (activeTab === 'pending') {
      return !isPaid && commission.packageStatus !== 'Cancelled';
    } else if (activeTab === 'paid') {
      return isPaid;
    }
    return true; // 'all' tab shows everything
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Commission</h1>
        <p className="text-gray-600">Track your earnings and payment status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Commission Earned
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalCommissionEarned || 0)}
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
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Commission Paid
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalCommissionPaid || 0)}
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
                <div className="w-8 h-8 rounded-md bg-yellow-500 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Commission
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.pendingCommission || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Commission Details
            </h3>
            
            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('paid')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'paid'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
          
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === 'pending' ? 'No pending commissions' : 
                 activeTab === 'paid' ? 'No paid commissions yet' : 
                 'No commission data'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'pending' ? 'All commissions have been paid or there are no approved packages yet.' :
                 activeTab === 'paid' ? 'Paid commissions will appear here once admin processes payments.' :
                 'Commission will appear here once packages are created and approved.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.packageId ?? commission.id ?? `lead-${commission.leadId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {commission.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {commission.packageType} Package
                          </div>
                          {commission.packageStatus === 'FromLead' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending (from lead)</span>
                          ) : (
                            <StatusBadge status={commission.packageStatus} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatCurrency(commission.commissionAmount)}
                          </div>
                          {commission.commissionPercent != null && (
                            <div className="text-sm text-gray-500">
                              {commission.commissionPercent}%
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {commission.finalAmount != null ? formatCurrency(commission.finalAmount) : '–'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentStatusIcon(commission.packageStatus, commission.isPaid || commission.paymentStatus === 'Paid')}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(commission.packageStatus, commission.isPaid || commission.paymentStatus === 'Paid')}`}>
                            {getPaymentStatusText(commission.packageStatus, commission.isPaid || commission.paymentStatus === 'Paid')}
                          </span>
                        </div>
                        {(commission.isPaid || commission.paymentStatus === 'Paid') && commission.paymentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid on {formatDate(commission.paymentDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(commission)}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Commission Details Modal */}
      {showModal && selectedCommission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Commission Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Customer Name</label>
                          <p className="text-sm text-gray-900">{selectedCommission.customerName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-sm text-gray-900">{selectedCommission.phone}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Package Type</label>
                          <p className="text-sm text-gray-900">{selectedCommission.packageType}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Package Status</label>
                          {selectedCommission.packageStatus === 'FromLead' ? (
                            <p className="text-sm text-gray-900">Pending (from lead – admin will create package on payment)</p>
                          ) : (
                            <StatusBadge status={selectedCommission.packageStatus} />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Commission Amount</label>
                          <p className="text-sm text-gray-900 font-medium">{formatCurrency(selectedCommission.commissionAmount)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Commission Rate</label>
                          <p className="text-sm text-gray-900">{selectedCommission.commissionPercent != null ? `${selectedCommission.commissionPercent}%` : '–'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Final Amount</label>
                          <p className="text-sm text-gray-900 font-medium">{selectedCommission.finalAmount != null ? formatCurrency(selectedCommission.finalAmount) : '–'}</p>
                        </div>
                      </div>

                      {(selectedCommission.isPaid || selectedCommission.paymentStatus === 'Paid') && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                              <p className="text-sm text-gray-900">{selectedCommission.transactionId}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                              <p className="text-sm text-gray-900">{formatDateTime(selectedCommission.paymentDate)}</p>
                            </div>
                          </div>
                          {selectedCommission.screenshotUrl && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-500">Payment Screenshot</label>
                              <a 
                                href={selectedCommission.screenshotUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-500"
                              >
                                View Screenshot →
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCommission;