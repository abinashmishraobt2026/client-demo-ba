import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  PhotoIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, leadsAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all'); // all | currentMonth | lastMonth | lastMonthTillDate
  const [dashboardData, setDashboardData] = useState({
    totalAssociates: 0,
    totalLeads: 0,
    activeLeads: 0,
    totalPackages: 0,
    totalCommissionPaid: 0
  });
  const [periodLabel, setPeriodLabel] = useState('');
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentLeads();
  }, [periodFilter]);

  const fetchDashboardData = async () => {
    try {
      const params = getPeriodParams(periodFilter);
      const response = await dashboardAPI.getAllAssociatesSummary(params);
      const data = response.data?.data ?? response.data;
      if (data) {
        setDashboardData({
          totalAssociates: data.associates?.length || 0,
          totalLeads: data.totals?.totalLeads || 0,
          activeLeads: data.totals?.activeLeads ?? 0,
          totalPackages: data.totals?.totalPackages ?? 0,
          totalCommissionPaid: data.totals?.totalCommissionPaid || 0
        });
        if (data.periodFrom && data.periodTo) {
          const from = data.periodFrom.slice(0, 10);
          const to = data.periodTo.slice(0, 10);
          setPeriodLabel(`${from} to ${to}`);
        } else {
          setPeriodLabel('');
        }
      }
    } catch {
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const response = await leadsAPI.getAll({ limit: 5, view: 'main' });
      const leadsData = response.data?.leads || response.data?.data?.leads || [];
      setRecentLeads(leadsData);
    } catch {
      setRecentLeads([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
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
      name: 'Total Associates',
      value: dashboardData.totalAssociates || 0,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      href: '/admin/associates',
      change: null, // change: '+12%',
      changeType: null
    },
    {
      name: 'Total Leads',
      value: dashboardData.totalLeads || 0,
      icon: DocumentTextIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      iconColor: 'text-green-600',
      href: '/admin/leads',
      change: null, // change: '+8%',
      changeType: null
    },
    {
      name: 'Active Leads',
      value: dashboardData.activeLeads || 0,
      icon: CheckCircleIcon,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      iconColor: 'text-teal-600',
      href: '/admin/leads?status=Active',
      change: null,
      changeType: null
    },
    {
      name: 'Total Packages',
      value: dashboardData.totalPackages || 0,
      icon: ClipboardDocumentListIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconColor: 'text-purple-600',
      href: '/admin/packages',
      change: null, // change: '+5%',
      changeType: null
    },
    {
      name: 'Commission Paid',
      value: formatCurrency(dashboardData.totalCommissionPaid || 0),
      icon: RupeeIcon,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      iconColor: 'text-amber-600',
      href: '/admin/commission-payments',
      change: null, // change: '+15%',
      changeType: null
    }
  ];

  return (
    <div className="space-y-2 page-enter">
      {/* Page Header - compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <ShieldCheckIcon className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-[11px] text-gray-500">Business overview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/admin/associates" className="btn-secondary w-full sm:w-auto justify-center text-xs py-1.5 px-3">
            <UsersIcon className="h-4 w-4 mr-1.5" />
            Manage Associates
          </Link>
          <Link to="/admin/leads" className="btn-primary w-full sm:w-auto justify-center text-xs py-1.5 px-3">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Period filter - slim */}
      <div className="bg-white rounded shadow-sm py-1.5 px-2 flex flex-wrap items-center gap-1.5">
        <label htmlFor="admin-period-filter" className="text-xs font-medium text-gray-700">Period:</label>
        <select
          id="admin-period-filter"
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

      {/* Stats Cards: mobile horizontal scroll, desktop grid */}
      <div className="sm:hidden flex overflow-x-auto gap-3 pb-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="flex-shrink-0 w-[220px] snap-start group relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
              <div className="relative p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className={`p-1.5 rounded bg-gradient-to-r ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-medium">{stat.change}</span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-gray-600 truncate">{stat.name}</p>
                <p className="text-base font-bold text-gray-900 truncate">{stat.value}</p>
                {stat.change && <p className="text-[10px] text-gray-500">vs last month</p>}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow border border-gray-100 overflow-hidden transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
              <div className="relative p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className={`p-1.5 rounded bg-gradient-to-r ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-gray-600 truncate">{stat.name}</p>
                <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
                {stat.change && <p className="text-[10px] text-gray-500">vs last month</p>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Leads</h3>
                </div>
                <Link to="/admin/leads" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  View all <ArrowTrendingUpIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {(!Array.isArray(recentLeads) || recentLeads.length === 0) ? (
                <div className="text-center py-8 sm:py-10">
                  <div className="p-3 bg-gray-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-1">No recent leads</h4>
                  <p className="text-sm text-gray-500 mb-3">Get started by adding your first lead</p>
                  <Link to="/admin/leads" className="btn-primary text-sm py-2">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Lead
                  </Link>
                </div>
              ) : (
                recentLeads.map((lead, index) => (
                  <div key={lead.id} className="p-4 sm:p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate group-hover:text-primary-600">{lead.customerName}</h4>
                          <StatusBadge status={lead.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs sm:text-sm text-gray-500">
                          <span className="truncate">{lead.associateName || 'Unassigned'}{lead.associateUniqueId ? ` (${lead.associateUniqueId})` : ''}</span>
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </div>
                      <Link to="/admin/leads" className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View in All Leads">
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Add Associate', href: '/admin/associates', icon: UsersIcon, gradient: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
                  { name: 'Manage Leads', href: '/admin/leads', icon: DocumentTextIcon, gradient: 'from-green-500 to-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
                  { name: 'Create Package', href: '/admin/packages', icon: ClipboardDocumentListIcon, gradient: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
                  { name: 'Manage Images', href: '/admin/package-images', icon: PhotoIcon, gradient: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.name} to={action.href} className={`flex flex-col items-center p-3 rounded-lg border border-gray-200 ${action.bgColor} transition-all duration-200 hover:shadow-md`}>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} mb-2`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 text-center">{action.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold">Business Performance</h3>
              </div>
              <p className="text-primary-100 text-sm mb-4 leading-relaxed">Your business is growing! Keep up the excellent work with your associates and leads.</p>
              <Link to="/admin/analytics" className="inline-flex items-center px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 text-sm font-medium">
                View Analytics <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;