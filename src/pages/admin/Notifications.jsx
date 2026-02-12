import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'NewLead':
      return '👤';
    case 'LeadAssigned':
      return '📋';
    case 'NewAssociateRegistration':
      return '👋';
    case 'PackageCreated':
    case 'AdminApproval':
      return '📦';
    case 'CommissionPaid':
      return '💰';
    case 'TripComplete':
      return '✈️';
    default:
      return '🔔';
  }
};

const formatNotificationTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffInMinutes = Math.floor((now - d) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const Notifications = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ limit: 50, offset: 0 });
      setList(response.data?.data || []);
    } catch {
      toast.error('Failed to load notifications');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setList(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      setClearing(true);
      await notificationsAPI.markAllAsRead();
      setList(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const unreadCount = list.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">View and manage system notifications</p>
        </div>
        {list.length > 0 && unreadCount > 0 && (
          <button
            type="button"
            onClick={clearAllNotifications}
            disabled={clearing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {clearing ? 'Clearing...' : 'Clear all notifications'}
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879l-.707.707A1 1 0 002 7.414V16.5A1.5 1.5 0 003.5 18H12v1H3.5A2.5 2.5 0 011 16.5V7.414a2 2 0 01.586-1.414l.707-.707a5 5 0 013.535-1.465z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              New leads, associate registrations, and approvals will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {list.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden>
                  {getNotificationIcon(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatNotificationTime(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="flex-shrink-0 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
