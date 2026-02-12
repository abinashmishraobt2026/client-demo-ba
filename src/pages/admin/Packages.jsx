import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { packagesAPI, leadsAPI } from '../../services/api';
import { formatCurrency, formatDate, debounce, calculateCommission, getCommissionPolicyRate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableLeadDropdown from '../../components/common/SearchableLeadDropdown';
import toast from 'react-hot-toast';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageTypeFilter, setPackageTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [actionType, setActionType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    leadId: '',
    packageType: 'Domestic',
    baseAmount: '',
    commissionPercent: '',
    commissionAmount: '',
    finalAmount: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPackages();
    fetchAvailableLeads();
  }, [pagination.page, statusFilter, packageTypeFilter]);

  // Refetch leads when Create Package modal opens so dropdown is always in sync with API
  useEffect(() => {
    if (showCreateModal) fetchAvailableLeads();
  }, [showCreateModal]);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (pagination.page === 1) {
        fetchPackages();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    debouncedSearch();
  }, [searchTerm]);

  // Auto-calculate commission when base amount or package type changes
  useEffect(() => {
    if (formData.baseAmount && formData.packageType) {
      const baseAmount = parseFloat(formData.baseAmount);
      if (!isNaN(baseAmount) && baseAmount > 0) {
        const commissionPercent = getCommissionPolicyRate(formData.packageType);
        const result = calculateCommission(baseAmount, commissionPercent);
        
        setFormData(prev => ({
          ...prev,
          commissionPercent: commissionPercent.toString(),
          commissionAmount: result.commissionAmount.toString(),
          finalAmount: result.finalAmount.toString()
        }));
      }
    }
  }, [formData.baseAmount, formData.packageType]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(packageTypeFilter && { packageType: packageTypeFilter })
      };

      const response = await packagesAPI.getAll(params);
      const data = response.data;
      // Backend wraps in ApiResponse: { success, message, data: { packages, totalCount, ... } }
      const payload = data?.data ?? data;
      const packagesData = Array.isArray(payload?.packages) ? payload.packages
        : Array.isArray(data.packages) ? data.packages
        : Array.isArray(data) ? data : [];
      const totalCount = payload?.totalCount ?? data.totalCount ?? data.total ?? packagesData.length;

      setPackages(packagesData);
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pagination.limit)
      }));
    } catch {
      setPackages([]);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLeads = async () => {
    try {
      const response = await leadsAPI.getAll({ status: 'Confirmed', withoutPackage: true });
      const data = response.data;
      // Backend: ApiResponse { data: { leads: [...], totalCount, ... } }
      const payload = data?.data ?? data;
      const leadsList = Array.isArray(payload?.leads) ? payload.leads
        : Array.isArray(data.leads) ? data.leads
        : Array.isArray(data) ? data : [];
      setLeads(leadsList);
    } catch {
      setLeads([]);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        leadId: parseInt(formData.leadId),
        packageType: formData.packageType,
        baseAmount: parseFloat(formData.baseAmount),
        commissionPercent: parseFloat(formData.commissionPercent),
        commissionAmount: parseFloat(formData.commissionAmount),
        finalAmount: parseFloat(formData.finalAmount)
      };

      await packagesAPI.create(submitData);
      toast.success('Package created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchPackages();
      fetchAvailableLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create package');
    }
  };

  const handleApprovePackage = async () => {
    try {
      await packagesAPI.approve(selectedPackage.id, { 
        finalAmount: parseFloat(formData.finalAmount),
        commissionAmount: parseFloat(formData.commissionAmount)
      });
      toast.success('Package approved successfully!');
      setShowApprovalModal(false);
      fetchPackages();
    } catch {
      toast.error('Failed to approve package');
    }
  };

  const handleStatusUpdate = async (packageId, newStatus) => {
    try {
      await packagesAPI.updateStatus(packageId, { status: newStatus });
      toast.success('Package status updated successfully');
      fetchPackages();
    } catch {
      toast.error('Failed to update package status');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.leadId) errors.leadId = 'Please select a lead';
    if (!formData.baseAmount || parseFloat(formData.baseAmount) <= 0) {
      errors.baseAmount = 'Base amount must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      leadId: '',
      packageType: 'Domestic',
      baseAmount: '',
      commissionPercent: '',
      commissionAmount: '',
      finalAmount: ''
    });
    setFormErrors({});
  };

  const handleApprovalClick = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      leadId: pkg.leadId.toString(),
      packageType: pkg.packageType,
      baseAmount: pkg.baseAmount.toString(),
      commissionPercent: pkg.commissionPercent.toString(),
      commissionAmount: pkg.commissionAmount.toString(),
      finalAmount: pkg.finalAmount.toString()
    });
    setShowApprovalModal(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      handleApprovePackage();
    }
    setShowConfirmModal(false);
    setSelectedPackage(null);
    setActionType('');
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'TripComplete', label: 'Trip Complete' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const packageTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Domestic', label: 'Domestic' },
    { value: 'International', label: 'International' },
    { value: 'Resort', label: 'Resort' }
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base font-bold text-gray-900">Packages</h1>
          <p className="text-xs text-gray-600">Create and manage travel packages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPackages}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create Package
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 sm:p-3 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="packages-search"
                name="packagesSearch"
                type="text"
                placeholder="Search by customer name or associate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="packages-status-filter" className="sr-only">Status</label>
            <select
              id="packages-status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Package Type Filter */}
          <div>
            <label htmlFor="packages-type-filter" className="sr-only">Package Type</label>
            <select
              id="packages-type-filter"
              name="packageTypeFilter"
              value={packageTypeFilter}
              onChange={(e) => setPackageTypeFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {packageTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="lg" />
          </div>
        ) : !Array.isArray(packages) || packages.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || packageTypeFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first package.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Customer & Associate</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Package</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Pricing</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(packages) && packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-gray-900">{pkg.customerName}</div>
                          <div className="text-[10px] text-gray-500">{pkg.associateName} ({pkg.associateUniqueId})</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{pkg.packageType} · {pkg.visitingLocation || '-'} · {pkg.numberOfPeople} ppl</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">Base: {formatCurrency(pkg.baseAmount)}</div>
                        <div className="text-[10px] text-green-600">Comm: {formatCurrency(pkg.commissionAmount)} · Total: {formatCurrency(pkg.finalAmount)}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="space-y-1">
                          <StatusBadge status={pkg.status} />
                          {!pkg.adminApproved && pkg.status === 'Draft' && (
                            <div className="text-xs text-orange-600">
                              Pending Approval
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(pkg.createdAt)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col space-y-1">
                          {!pkg.adminApproved && pkg.status === 'Draft' && (
                            <button
                              onClick={() => handleApprovalClick(pkg)}
                              className="text-green-600 hover:text-green-900 inline-flex items-center"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Review & Approve
                            </button>
                          )}
                          
                          {pkg.adminApproved && pkg.status !== 'TripComplete' && pkg.status !== 'Cancelled' && (
                            <select
                              id={`pkg-status-${pkg.id}`}
                              name="status"
                              value={pkg.status}
                              onChange={(e) => handleStatusUpdate(pkg.id, e.target.value)}
                              className="text-sm border-0 bg-transparent focus:ring-0 focus:border-0"
                            >
                              <option value="Approved">Approved</option>
                              <option value="TripComplete">Trip Complete</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200 text-xs">
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

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreatePackage}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Create New Package
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Select Lead *</label>
                          <div className="mt-1">
                            <SearchableLeadDropdown
                              leads={leads}
                              value={formData.leadId}
                              onChange={(id) => setFormData({ ...formData, leadId: id })}
                              placeholder="Choose a confirmed lead"
                              hasError={!!formErrors.leadId}
                            />
                          </div>
                          {formErrors.leadId && <p className="mt-1 text-sm text-red-600">{formErrors.leadId}</p>}
                        </div>

                        <div>
                          <label htmlFor="create-package-type" className="block text-sm font-medium text-gray-700">Package Type *</label>
                          <select
                            id="create-package-type"
                            name="packageType"
                            value={formData.packageType}
                            onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="Domestic">Domestic (3%)</option>
                            <option value="International">International (5%)</option>
                            <option value="Resort">Resort (3%)</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="create-base-amount" className="block text-sm font-medium text-gray-700">Base Amount (₹) *</label>
                          <input
                            id="create-base-amount"
                            name="baseAmount"
                            type="number"
                            value={formData.baseAmount}
                            onChange={(e) => setFormData({...formData, baseAmount: e.target.value})}
                            min="0"
                            step="0.01"
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.baseAmount ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter base package amount"
                          />
                          {formErrors.baseAmount && <p className="mt-1 text-sm text-red-600">{formErrors.baseAmount}</p>}
                        </div>

                        {formData.baseAmount && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Commission Calculation</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Base Amount:</span>
                                <span>{formatCurrency(parseFloat(formData.baseAmount) || 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Commission ({formData.commissionPercent}%):</span>
                                <span className="text-green-600">{formatCurrency(parseFloat(formData.commissionAmount) || 0)}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t pt-1">
                                <span>Final Package Price:</span>
                                <span className="text-primary-600">{formatCurrency(parseFloat(formData.finalAmount) || 0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Package
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Package Approval Modal */}
      {showApprovalModal && selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowApprovalModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Review & Approve Package
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Package Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Customer:</strong> {selectedPackage.customerName}</div>
                          <div><strong>Associate:</strong> {selectedPackage.associateName} ({selectedPackage.associateUniqueId})</div>
                          <div><strong>Package Type:</strong> {selectedPackage.packageType}</div>
                          <div><strong>Location:</strong> {selectedPackage.visitingLocation || 'TBD'}</div>
                          <div><strong>People:</strong> {selectedPackage.numberOfPeople}</div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="approval-final-amount" className="block text-sm font-medium text-gray-700">Final Amount (₹)</label>
                        <input
                          id="approval-final-amount"
                          name="finalAmount"
                          type="number"
                          value={formData.finalAmount}
                          onChange={(e) => {
                            const finalAmount = parseFloat(e.target.value) || 0;
                            const baseAmount = parseFloat(formData.baseAmount) || 0;
                            const commissionAmount = finalAmount - baseAmount;
                            
                            setFormData(prev => ({
                              ...prev,
                              finalAmount: e.target.value,
                              commissionAmount: commissionAmount.toString()
                            }));
                          }}
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          You can adjust the final amount if needed
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Final Pricing Breakdown</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          <div className="flex justify-between">
                            <span>Base Amount:</span>
                            <span>{formatCurrency(parseFloat(formData.baseAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commission Amount:</span>
                            <span>{formatCurrency(parseFloat(formData.commissionAmount) || 0)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t border-blue-200 pt-1">
                            <span>Final Package Price:</span>
                            <span>{formatCurrency(parseFloat(formData.finalAmount) || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleApprovePackage}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Approve Package
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;