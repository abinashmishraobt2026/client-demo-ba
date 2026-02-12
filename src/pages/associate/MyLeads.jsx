import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { leadsAPI } from '../../services/api';
import { isAdmin } from '../../utils/auth';
import { formatCurrency, formatDate, debounce } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LeadDetailModal from '../../components/common/LeadDetailModal';
import toast from 'react-hot-toast';

const MyLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('main'); // main | notInterested | tripCompleted | other | all
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, viewFilter]);

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
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        search: searchTerm
      };
      if (viewFilter && viewFilter !== 'all') {
        params.view = viewFilter;
      }

      const response = await leadsAPI.getMy(params);
      const data = response.data;
      const leadsData = Array.isArray(data.leads) ? data.leads :
                       Array.isArray(data.data?.leads) ? data.data.leads :
                       Array.isArray(data.data) ? data.data :
                       Array.isArray(data) ? data : [];
      
      setLeads(leadsData);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.totalCount || data.totalCount || data.total || leadsData.length,
        totalPages: Math.ceil((data.pagination?.totalCount || data.totalCount || data.total || leadsData.length) / pagination.limit)
      }));
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const viewSegments = [
    { value: 'main', label: 'Active & New' },
    { value: 'notInterested', label: 'Not Interested' },
    { value: 'tripCompleted', label: 'Trip Completed' },
    { value: 'other', label: 'Other' },
    { value: 'all', label: 'View all' }
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">My Leads</h1>
          <p className="text-xs text-gray-500">Manage your leads</p>
        </div>
        <Link
          to="/add-lead"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap shrink-0"
        >
          <PlusIcon className="h-5 w-5 flex-shrink-0" />
          Add New Lead
        </Link>
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

      {/* Search */}
      <div className="bg-white p-2 sm:p-3 rounded shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="my-leads-search"
            name="search"
            type="text"
            placeholder="Search by customer name, phone, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
{searchTerm || viewFilter !== 'main'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first lead.'
              }
            </p>
            {!searchTerm && viewFilter === 'main' && (
              <div className="mt-6">
                <Link
                  to="/add-lead"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Lead
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Travel Details
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Budget
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Package Type
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(leads) && leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
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
                        <div className="text-sm text-gray-900">
                          <div>{lead.visitingLocation || 'Location TBD'}</div>
                          <div className="text-gray-500">
                            {lead.numberOfPeople} people
                          </div>
                          {lead.visitingDate && (
                            <div className="text-gray-500">
                              {formatDate(lead.visitingDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {lead.clientBudget ? formatCurrency(lead.clientBudget) : 'Not specified'}
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
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDetailModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </button>
                          {lead.attachmentUrl ? (
                            <a
                              href={lead.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 inline-flex items-center"
                              title="View attachment (uploaded by admin)"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-gray-300 cursor-default inline-flex" title="No attachment">
                              <DocumentArrowDownIcon className="h-4 w-4" />
                            </span>
                          )}
                          {isAdmin() && (
                            <Link
                              to={`/my-leads/${lead.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
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
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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

      {showDetailModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};

export default MyLeads;