import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlusIcon, 
  ClockIcon,
  EyeIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, leadsAPI } from '../../services/api';
import { getUserId } from '../../utils/auth';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LeadDetailModal from '../../components/common/LeadDetailModal';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const getPeriodParams = (period) => {
  if (!period || period === 'all') return {};
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  if (period === 'currentMonth') {
    const from = new Date(y, m, 1);
    const to = new Date(y, m + 1, 0);
    return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10) };
  }
  if (period === 'lastMonth') {
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0);
    return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10) };
  }
  if (period === 'lastMonthTillDate') {
    const from = new Date(y, m - 1, 1);
    const to = new Date();
    return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10) };
  }
  return {};
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [periodLabel, setPeriodLabel] = useState('');
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalLeads: 0,
    activeLeads: 0,
    totalCommissionPaid: 0,
    pendingCommission: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [leadsPage, setLeadsPage] = useState(0);
  const [leadsPagination, setLeadsPagination] = useState({ totalCount: 0, hasMore: false });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const userId = getUserId();

  useEffect(() => {
    fetchDashboardData();
  }, [periodFilter]);

  useEffect(() => {
    fetchRecentLeads(leadsPage);
  }, [leadsPage]);

  const fetchDashboardData = async () => {
    try {
      const params = getPeriodParams(periodFilter);
      const response = await dashboardAPI.getAssociateDashboard(userId, params);
      const data = (response.data?.data ?? response.data) || {};
      setDashboardData({
        totalLeads: data.totalLeads ?? data.summary?.totalLeads ?? 0,
        activeLeads: data.summary?.activeLeads ?? 0,
        totalCommissionPaid: data.totalCommissionPaid ?? data.summary?.totalCommissionPaid ?? 0,
        pendingCommission: data.pendingCommission ?? data.summary?.pendingCommission ?? 0
      });
      if (data.periodFrom && data.periodTo) {
        setPeriodLabel(`${data.periodFrom.slice(0, 10)} to ${data.periodTo.slice(0, 10)}`);
      } else {
        setPeriodLabel('');
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLeads = async (page) => {
    setLeadsLoading(true);
    try {
      const response = await leadsAPI.getMy({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, view: 'main' });
      const resData = response.data?.data || response.data;
      const leadsData = resData?.leads || [];
      const pagination = resData?.pagination || {};
      setRecentLeads(leadsData);
      setLeadsPagination({
        totalCount: pagination.totalCount ?? leadsData.length,
        hasMore: pagination.hasMore ?? false
      });
    } catch {
      setRecentLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const RupeeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.9494914,6 C13.4853936,6.52514205 13.8531598,7.2212202 13.9645556,8 L17.5,8 C17.7761424,8 18,8.22385763 18,8.5 C18,8.77614237 17.7761424,9 17.5,9 L13.9645556,9 C13.7219407,10.6961471 12.263236,12 10.5,12 L7.70710678,12 L13.8535534,18.1464466 C14.0488155,18.3417088 14.0488155,18.6582912 13.8535534,18.8535534 C13.6582912,19.0488155 13.3417088,19.0488155 13.1464466,18.8535534 L6.14644661,11.8535534 C5.83146418,11.538571 6.05454757,11 6.5,11 L10.5,11 C11.709479,11 12.7183558,10.1411202 12.9499909,9 L6.5,9 C6.22385763,9 6,8.77614237 6,8.5 C6,8.22385763 6.22385763,8 6.5,8 L12.9499909,8 C12.7183558,6.85887984 11.709479,6 10.5,6 L6.5,6 C6.22385763,6 6,5.77614237 6,5.5 C6,5.22385763 6.22385763,5 6.5,5 L10.5,5 L17.5,5 C17.7761424,5 18,5.22385763 18,5.5 C18,5.77614237 17.7761424,6 17.5,6 L12.9494914,6 L12.9494914,6 Z" />
    </svg>
  );

  const stats = [
    {
      name: 'Total Leads Added',
      value: dashboardData.totalLeads || 0,
      subtitle: null,
      icon: UserPlusIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderAccent: 'border-l-blue-500',
      href: '/my-leads'
    },
    {
      name: 'Active Leads',
      value: dashboardData.activeLeads || 0,
      subtitle: 'Confirmed, trip not yet completed',
      icon: CheckCircleIcon,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      borderAccent: 'border-l-teal-500',
      href: '/my-leads?status=Active'
    },
    {
      name: 'Total Income (Paid)',
      value: formatCurrency(dashboardData.totalCommissionPaid || 0),
      subtitle: 'Your commission received',
      icon: RupeeIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderAccent: 'border-l-green-500',
      href: '/my-commission'
    },
    {
      name: 'Pending Commission',
      value: formatCurrency(dashboardData.pendingCommission || 0),
      subtitle: 'Commission earned, not yet paid',
      icon: ClockIcon,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      borderAccent: 'border-l-amber-500',
      href: '/my-commission'
    }
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', emoji: '☀️' };
    if (h < 17) return { text: 'Good afternoon', emoji: '👋' };
    return { text: 'Good evening', emoji: '🌙' };
  })();

  return (
    <div className="space-y-3">
      {/* Welcome strip */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl px-4 py-3 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-primary-100">{greeting.text} {greeting.emoji}</p>
            <h1 className="text-lg font-bold">Your performance at a glance</h1>
          </div>
          <Link
            to="/add-lead"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-primary-600 hover:bg-primary-50 shadow transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Lead
          </Link>
        </div>
      </div>

      {/* Period filter - slim */}
      <div className="bg-white rounded-lg shadow-sm py-2 px-3 flex flex-wrap items-center gap-2 border border-gray-100">
        <label htmlFor="associate-period-filter" className="text-xs font-medium text-gray-700">Period:</label>
        <select
          id="associate-period-filter"
          name="periodFilter"
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="block pl-2 pr-6 py-1.5 text-xs border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All time</option>
          <option value="currentMonth">Current month</option>
          <option value="lastMonth">Last month (1–31)</option>
          <option value="lastMonthTillDate">Last month till date</option>
        </select>
        {periodLabel && (
          <span className="text-xs text-gray-500">({periodLabel})</span>
        )}
      </div>

      {/* Stats Cards: attractive cards with left accent */}
      <div className="md:hidden flex overflow-x-auto gap-3 pb-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className={`group flex-shrink-0 w-[200px] snap-start relative bg-white rounded-xl shadow-md hover:shadow-lg border-l-4 ${stat.borderAccent} overflow-hidden transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-90 transition-opacity duration-300`} />
              <div className="relative p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 truncate">{stat.name}</p>
                    <p className="text-base font-bold text-gray-900 truncate mt-0.5">{stat.value}</p>
                    {stat.subtitle && <p className="text-[10px] text-gray-400 truncate mt-0.5">{stat.subtitle}</p>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 border-l-4 ${stat.borderAccent} overflow-hidden transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-90 transition-opacity duration-300`} />
              <div className="relative p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 truncate">{stat.name}</p>
                    <p className="text-base font-bold text-gray-900 truncate mt-0.5">{stat.value}</p>
                    {stat.subtitle && <p className="text-[10px] text-gray-400 truncate mt-0.5">{stat.subtitle}</p>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-primary-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Recent Leads</h3>
            </div>
            <Link to="/my-leads" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          
          {recentLeads.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gray-50/50 rounded-lg">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center">
                <UserPlusIcon className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">No leads yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Add your first lead and start earning commission with OffbeatTrips.
              </p>
              <Link
                to="/add-lead"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Add your first lead
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-1">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Budget</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-3 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leadsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                          <LoadingSpinner size="sm" className="mx-auto" />
                        </td>
                      </tr>
                    ) : (
                      recentLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-900">{lead.customerName}</div>
                            <div className="text-[10px] text-gray-500">{lead.phone}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-xs text-gray-900">{lead.visitingLocation || '-'}</div>
                            <div className="text-[10px] text-gray-500">{lead.numberOfPeople} people</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                            {lead.clientBudget ? formatCurrency(lead.clientBudget) : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={lead.status} /></td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{formatDate(lead.createdAt)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button type="button" onClick={() => { setSelectedLead(lead); setShowDetailModal(true); }}
                              className="text-primary-600 hover:text-primary-900 text-xs font-medium">View</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {leadsPagination.totalCount > PAGE_SIZE && !leadsLoading && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 text-xs">
                  <div className="text-gray-600">
                    Showing {leadsPage * PAGE_SIZE + 1} to {Math.min((leadsPage + 1) * PAGE_SIZE, leadsPagination.totalCount)} of {leadsPagination.totalCount} leads
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLeadsPage((p) => Math.max(0, p - 1))}
                      disabled={leadsPage === 0}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadsPage((p) => p + 1)}
                      disabled={!leadsPagination.hasMore}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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

export default Dashboard;