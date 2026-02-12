import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  UserPlusIcon,
  FunnelIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { associatesAPI } from '../../services/api';
import { formatCurrency, formatDate, debounce } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const AllAssociates = () => {
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [actionType, setActionType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAssociates();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      fetchAssociates();
    }, 500);

    debouncedSearch();
  }, [searchTerm]);

  const fetchAssociates = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        status: statusFilter
      };

      const response = await associatesAPI.getAll(params);
      const associatesData = response.data?.associates || response.data?.data?.associates || [];
      setAssociates(Array.isArray(associatesData) ? associatesData : []);
    } catch {
      setAssociates([]);
      toast.error('Failed to load associates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssociate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await associatesAPI.create(formData);
      toast.success('Associate added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchAssociates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add associate');
    }
  };

  const handleApproveAssociate = async (associate) => {
    try {
      const response = await associatesAPI.approve(associate.id);
      toast.success('Associate approved successfully and welcome email sent');
      fetchAssociates();
    } catch {
      toast.error('Failed to approve associate');
    }
  };

  const handleToggleStatus = async (associate) => {
    try {
      const newStatus = !associate.isActive;
      await associatesAPI.toggleStatus(associate.id, { isActive: newStatus });
      toast.success(`Associate ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAssociates();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('pending approval')) {
        toast.error('Associate is pending approval. Please approve first.');
      } else {
        toast.error('Failed to update associate status');
      }
    }
  };

  const handleResetPassword = async (associate) => {
    try {
      await associatesAPI.resetPassword(associate.id);
      toast.success('Password reset email sent successfully');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.accountNumber.trim()) errors.accountNumber = 'Account number is required';
    if (!formData.ifscCode.trim()) errors.ifscCode = 'IFSC code is required';
    if (!formData.upiId.trim()) errors.upiId = 'UPI ID is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    });
    setFormErrors({});
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      handleApproveAssociate(selectedAssociate);
    } else if (actionType === 'toggleStatus') {
      handleToggleStatus(selectedAssociate);
    } else if (actionType === 'resetPassword') {
      handleResetPassword(selectedAssociate);
    }
    setShowConfirmModal(false);
    setSelectedAssociate(null);
    setActionType('');
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base font-bold text-gray-900">All Associates</h1>
          <p className="text-xs text-gray-600">Manage associates and performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Associate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 sm:p-3 rounded shadow">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="associates-search"
                name="associatesSearch"
                type="text"
                placeholder="Search by name, email, or unique ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <label htmlFor="associates-status-filter" className="sr-only">Status</label>
              <select
                id="associates-status-filter"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Associates Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="lg" />
          </div>
        ) : associates.length === 0 ? (
          <div className="text-center py-6">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No associates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first associate.'
              }
            </p>
            {!searchTerm && !statusFilter && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Associate
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Associate</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {associates.map((associate) => (
                  <tr key={associate.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-medium text-gray-900">{associate.name}</div>
                        <div className="text-[10px] text-gray-500">{associate.uniqueId} · {associate.email}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">{associate.totalLeads || 0} leads, {associate.totalPackages || 0} pkgs</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">Paid: {formatCurrency(associate.totalCommissionPaid || 0)}</div>
                      <div className="text-[10px] text-gray-500">Pending: {formatCurrency(associate.pendingCommission || 0)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusBadge 
                        status={
                          associate.isActive 
                            ? 'Active' 
                            : 'Pending Approval'
                        } 
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(associate.createdAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex space-x-2">
                        {/* Show Approve button for inactive associates with pending approval */}
                        {!associate.isActive && (
                          <button
                            onClick={() => {
                              setSelectedAssociate(associate);
                              setActionType('approve');
                              setShowConfirmModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        )}
                        
                        {/* Show Activate/Deactivate for already approved associates */}
                        {associate.isActive && (
                          <button
                            onClick={() => {
                              setSelectedAssociate(associate);
                              setActionType('toggleStatus');
                              setShowConfirmModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded text-red-600 hover:text-red-900"
                          >
                            Deactivate
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedAssociate(associate);
                            setActionType('resetPassword');
                            setShowConfirmModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        >
                          <KeyIcon className="h-4 w-4 mr-1" />
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Associate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddAssociate}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Add New Associate
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="add-associate-name" className="block text-sm font-medium text-gray-700">Name *</label>
                          <input
                            id="add-associate-name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.name ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter full name"
                          />
                          {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="add-associate-email" className="block text-sm font-medium text-gray-700">Email *</label>
                          <input
                            id="add-associate-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.email ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter email address"
                          />
                          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="add-associate-account" className="block text-sm font-medium text-gray-700">Account Number *</label>
                          <input
                            id="add-associate-account"
                            name="accountNumber"
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.accountNumber ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter bank account number"
                          />
                          {formErrors.accountNumber && <p className="mt-1 text-sm text-red-600">{formErrors.accountNumber}</p>}
                        </div>

                        <div>
                          <label htmlFor="add-associate-ifsc" className="block text-sm font-medium text-gray-700">IFSC Code *</label>
                          <input
                            id="add-associate-ifsc"
                            name="ifscCode"
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.ifscCode ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter IFSC code"
                          />
                          {formErrors.ifscCode && <p className="mt-1 text-sm text-red-600">{formErrors.ifscCode}</p>}
                        </div>

                        <div>
                          <label htmlFor="add-associate-upi" className="block text-sm font-medium text-gray-700">UPI ID *</label>
                          <input
                            id="add-associate-upi"
                            name="upiId"
                            type="text"
                            value={formData.upiId}
                            onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.upiId ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter UPI ID"
                          />
                          {formErrors.upiId && <p className="mt-1 text-sm text-red-600">{formErrors.upiId}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Associate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={
          actionType === 'approve' ? 'Confirm Associate Approval' :
          actionType === 'toggleStatus' ? 'Confirm Status Change' : 
          'Confirm Password Reset'
        }
        message={
          actionType === 'approve'
            ? `Are you sure you want to approve ${selectedAssociate?.name}? They will receive a welcome email with login credentials.`
            : actionType === 'toggleStatus' 
            ? `Are you sure you want to ${selectedAssociate?.isActive ? 'deactivate' : 'activate'} ${selectedAssociate?.name}?`
            : `Are you sure you want to reset the password for ${selectedAssociate?.name}? They will receive an email with new login credentials.`
        }
        confirmText={
          actionType === 'approve' ? 'Approve Associate' :
          actionType === 'toggleStatus' ? 'Change Status' : 
          'Reset Password'
        }
        type={
          actionType === 'approve' ? 'success' :
          actionType === 'toggleStatus' ? 'warning' : 
          'info'
        }
      />
    </div>
  );
};

export default AllAssociates;