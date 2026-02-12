import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { leadsAPI, dashboardAPI } from '../../services/api';
import { formatCurrency, formatDate, debounce } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableAssociateDropdown from '../../components/common/SearchableAssociateDropdown';
import FileUpload, { FilePreview } from '../../components/common/FileUpload';
import toast from 'react-hot-toast';

const AllLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('main'); // main | notInterested | tripCompleted | other | all
  const [associateFilter, setAssociateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [actionType, setActionType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    numberOfPeople: 1,
    visitingDate: '',
    visitingLocation: '',
    currentLocation: '',
    clientBudget: '',
    associateId: '',
    status: 'NotAnswer',
    remarks: '',
    packageType: '',
    attachmentUrl: ''
  });
  const [uploadedAttachment, setUploadedAttachment] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [associates, setAssociates] = useState([]);

  useEffect(() => {
    fetchLeads();
    fetchAssociates();
  }, [pagination.page, viewFilter, associateFilter]);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (pagination.page === 1) {
        fetchLeads();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    debouncedSearch();
  }, [searchTerm]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        associateId: associateFilter
      };
      if (viewFilter && viewFilter !== 'all') {
        params.view = viewFilter;
      }

      const response = await leadsAPI.getAll(params);
      const data = response.data;
      
      // The API returns leads in data.leads structure
      const leadsData = data.leads || data.data?.leads || [];
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      
      setPagination(prev => ({
        ...prev,
        total: data.totalCount || data.data?.totalCount || 0,
        totalPages: Math.ceil((data.totalCount || data.data?.totalCount || 0) / pagination.limit)
      }));
    } catch {
      setLeads([]);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociates = async () => {
    try {
      // Get associates from the associates API instead
      const response = await leadsAPI.getAll({ associatesOnly: true });
      // For now, let's get associates from a different endpoint
      // We'll use the dashboard API to get associates list
      const dashboardResponse = await dashboardAPI.getAllAssociatesSummary();
      const associatesData = dashboardResponse.data?.data?.associates || [];
      setAssociates(associatesData);
    } catch (error) {
      setAssociates([]);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        clientBudget: formData.clientBudget ? parseFloat(formData.clientBudget) : null,
        numberOfPeople: parseInt(formData.numberOfPeople),
        associateId: formData.associateId ? parseInt(formData.associateId) : null
      };

      await leadsAPI.create(submitData);
      toast.success('Lead added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lead');
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        clientBudget: formData.clientBudget ? parseFloat(formData.clientBudget) : null,
        numberOfPeople: parseInt(formData.numberOfPeople),
        associateId: formData.associateId ? parseInt(formData.associateId) : null,
        attachmentUrl: (uploadedAttachment?.url || formData.attachmentUrl) || null
      };

      await leadsAPI.update(selectedLead.id, submitData);
      toast.success('Lead updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    }
  };

  const handleDeleteLead = async () => {
    try {
      await leadsAPI.delete(selectedLead.id);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    if (!newStatus) return;
    try {
      await leadsAPI.updateStatus(leadId, { status: String(newStatus).trim(), remarks: '' });
      toast.success('Lead status updated successfully');
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.data?.error || 'Failed to update lead status');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customerName.trim()) errors.customerName = 'Customer name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 50) {
      errors.numberOfPeople = 'Number of people must be between 1 and 50';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      numberOfPeople: 1,
      visitingDate: '',
      visitingLocation: '',
      currentLocation: '',
      clientBudget: '',
      associateId: '',
      status: 'NotAnswer',
      remarks: '',
      packageType: '',
      attachmentUrl: ''
    });
    setUploadedAttachment(null);
    setFormErrors({});
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setFormData({
      customerName: lead.customerName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      numberOfPeople: lead.numberOfPeople || 1,
      visitingDate: lead.visitingDate ? lead.visitingDate.split('T')[0] : '',
      visitingLocation: lead.visitingLocation || '',
      currentLocation: lead.currentLocation || '',
      clientBudget: lead.baseClientBudget ?? lead.clientBudget ?? '',
      associateId: lead.associateId || '',
      status: lead.status || 'NotAnswer',
      remarks: lead.remarks || '',
      packageType: lead.packageType || '',
      attachmentUrl: lead.attachmentUrl || ''
    });
    setUploadedAttachment(null);
    setShowEditModal(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'delete') {
      handleDeleteLead();
    }
    setShowConfirmModal(false);
    setSelectedLead(null);
    setActionType('');
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Segment tabs: main = Active & New (default), then Not Interested, Trip Completed, Other, View all
  const viewSegments = [
    { value: 'main', label: 'Active & New' },
    { value: 'notInterested', label: 'Not Interested' },
    { value: 'tripCompleted', label: 'Trip Completed' },
    { value: 'other', label: 'Other' },
    { value: 'all', label: 'View all' }
  ];
  // For in-row status update dropdown (API): all statuses except filter-only "Active"
  const statusUpdateOptions = [
    { value: 'NotAnswer', label: 'No Answer' },
    { value: 'NotInterested', label: 'Not Interested' },
    { value: 'NotDecide', label: 'Not Decided' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'TripCompleted', label: 'Trip Completed' },
    { value: 'TripCancelled', label: 'Trip Cancelled' }
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base font-bold text-gray-900">All Leads</h1>
          <p className="text-xs text-gray-600">Manage leads across associates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLeads}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Segment tabs */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-0.5 p-1.5" aria-label="Lead segments">
            {viewSegments.map((seg) => (
              <button
                key={seg.value}
                type="button"
                onClick={() => { setViewFilter(seg.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className={`inline-flex items-center px-2 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                  viewFilter === seg.value
                    ? 'bg-primary-100 text-primary-800 border border-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-2 sm:p-3 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="leads-search"
                name="leadsSearch"
                type="text"
                placeholder="Search by customer name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <SearchableAssociateDropdown
              associates={associates}
              value={associateFilter}
              onChange={setAssociateFilter}
              placeholder="All Associates"
              emptyOptionLabel="All Associates"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || viewFilter !== 'main' || associateFilter || searchTerm
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first lead.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Travel</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Package</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Associate</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                            {lead.customerName}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="text-sm text-gray-500">
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          <div>{lead.visitingLocation || 'Location TBD'}</div>
                          <div className="text-gray-500">
                            {lead.numberOfPeople} people
                          </div>
                          {lead.visitingDate && (
                            <div className="text-gray-500">
                              {formatDate(lead.visitingDate)}
                            </div>
                          )}
                          {lead.clientBudget && (
                            <div className="text-gray-500">
                              Budget: {formatCurrency(lead.clientBudget)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {lead.packageType ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.packageType === 'Domestic' ? 'bg-blue-100 text-blue-800' :
                            lead.packageType === 'International' ? 'bg-green-100 text-green-800' :
                            lead.packageType === 'Resort' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.packageType}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Not Specified
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {lead.associateName || 'Unassigned'}
                        </div>
                        {lead.associateUniqueId && (
                          <div className="text-sm text-gray-500">
                            {lead.associateUniqueId}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <select
                          id={`lead-status-${lead.id}`}
                          name="status"
                          value={lead.status}
                          onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                          className="text-sm border-0 bg-transparent focus:ring-0 focus:border-0"
                        >
                          {statusUpdateOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(lead)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setActionType('delete');
                              setShowConfirmModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
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

      {/* Add/Edit Lead Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={showAddModal ? handleAddLead : handleUpdateLead}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {showAddModal ? 'Add New Lead' : 'Edit Lead'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="lead-customer-name" className="block text-sm font-medium text-gray-700">Customer Name *</label>
                          <input
                            id="lead-customer-name"
                            name="customerName"
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.customerName ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter customer name"
                          />
                          {formErrors.customerName && <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>}
                        </div>

                        <div>
                          <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-700">Phone *</label>
                          <input
                            id="lead-phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                              formErrors.phone ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter phone number"
                          />
                          {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                        </div>

                        <div>
                          <label htmlFor="lead-email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            id="lead-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Number of People *</label>
                          <div className={`mt-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white ${
                            formErrors.numberOfPeople ? 'border-red-300' : 'border-gray-300'
                          }`}>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, numberOfPeople: Math.max(1, (prev.numberOfPeople || 1) - 1) }))}
                              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-lg leading-none"
                              aria-label="Decrease"
                            >
                              −
                            </button>
                            <span className="flex-1 text-center text-sm font-medium tabular-nums min-w-[2rem]">
                              {formData.numberOfPeople ?? 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, numberOfPeople: Math.min(50, (prev.numberOfPeople || 1) + 1) }))}
                              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-lg leading-none"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                          {formErrors.numberOfPeople && <p className="mt-1 text-sm text-red-600">{formErrors.numberOfPeople}</p>}
                        </div>

                        <div>
                          <label htmlFor="lead-visiting-location" className="block text-sm font-medium text-gray-700">Travel Destination</label>
                          <input
                            id="lead-visiting-location"
                            name="visitingLocation"
                            type="text"
                            value={formData.visitingLocation}
                            onChange={(e) => setFormData({...formData, visitingLocation: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Where do they want to visit?"
                          />
                        </div>

                        <div>
                          <label htmlFor="lead-current-location" className="block text-sm font-medium text-gray-700">Current Location</label>
                          <input
                            id="lead-current-location"
                            name="currentLocation"
                            type="text"
                            value={formData.currentLocation}
                            onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Where are they from?"
                          />
                        </div>

                        <div>
                          <label htmlFor="lead-visiting-date" className="block text-sm font-medium text-gray-700">Travel Date</label>
                          <input
                            id="lead-visiting-date"
                            name="visitingDate"
                            type="date"
                            value={formData.visitingDate}
                            onChange={(e) => setFormData({...formData, visitingDate: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="lead-client-budget" className="block text-sm font-medium text-gray-700">Client Budget (₹)</label>
                          <input
                            id="lead-client-budget"
                            name="clientBudget"
                            type="number"
                            value={formData.clientBudget}
                            onChange={(e) => setFormData({...formData, clientBudget: e.target.value})}
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Enter budget amount"
                          />
                        </div>

                        <div>
                          <label htmlFor="lead-package-type" className="block text-sm font-medium text-gray-700">Package Type</label>
                          <select
                            id="lead-package-type"
                            name="packageType"
                            value={formData.packageType}
                            onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            <option value="">Select Package Type</option>
                            <option value="Domestic">Domestic</option>
                            <option value="International">International</option>
                            <option value="Resort">Resort</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Assign to Associate</label>
                          <div className="mt-1">
                            <SearchableAssociateDropdown
                              associates={associates}
                              value={formData.associateId}
                              onChange={(id) => setFormData({ ...formData, associateId: id })}
                              placeholder="Select Associate"
                              emptyOptionLabel="Select Associate"
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="lead-status" className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            id="lead-status"
                            name="status"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {statusUpdateOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="lead-remarks" className="block text-sm font-medium text-gray-700">Details</label>
                          <textarea
                            id="lead-remarks"
                            name="remarks"
                            rows={3}
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Package/lead details for associate (visible when confirmed)..."
                          />
                        </div>

                        {showEditModal && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Attachment (PDF, Excel, CSV, Word, image)</label>
                            <p className="text-xs text-gray-500 mt-0.5">Optional. Associate will see this in lead details.</p>
                            {uploadedAttachment ? (
                              <div className="mt-2 flex items-center gap-2">
                                <FilePreview file={uploadedAttachment} onRemove={() => { setUploadedAttachment(null); setFormData(prev => ({ ...prev, attachmentUrl: '' })); }} className="max-h-16" />
                                <span className="text-sm text-green-600">New file uploaded</span>
                              </div>
                            ) : formData.attachmentUrl ? (
                              <div className="mt-2 flex items-center gap-2">
                                <a href={formData.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate max-w-xs">Current attachment</a>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, attachmentUrl: '' }))} className="text-xs text-gray-500 hover:text-red-600">Remove</button>
                              </div>
                            ) : null}
                            {(!uploadedAttachment && !formData.attachmentUrl) && (
                              <div className="mt-2">
                                <FileUpload
                                  uploadType="associateDocument"
                                  accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,image/*"
                                  maxSize={10}
                                  onUploadSuccess={(data) => {
                                    const file = data?.file || data?.files?.[0];
                                    if (file?.url) {
                                      setUploadedAttachment(file);
                                      setFormData(prev => ({ ...prev, attachmentUrl: file.url }));
                                      toast.success('Attachment uploaded');
                                    }
                                  }}
                                  onUploadError={() => toast.error('Upload failed')}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {showAddModal ? 'Add Lead' : 'Update Lead'}
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
        title="Confirm Delete"
        message={`Are you sure you want to delete the lead for ${selectedLead?.customerName}? This action cannot be undone.`}
        confirmText="Delete Lead"
        type="danger"
      />
    </div>
  );
};

export default AllLeads;