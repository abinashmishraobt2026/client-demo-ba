import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  ServerIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { systemAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SystemManagement = () => {
  const [emailTest, setEmailTest] = useState({
    email: '',
    loading: false,
    result: null
  });
  const [systemStatus, setSystemStatus] = useState({
    loading: true,
    data: null,
    error: null
  });
  const [emailAll, setEmailAll] = useState({
    showModal: false,
    subject: '',
    content: '',
    count: null,
    loadingCount: false,
    sending: false
  });

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await systemAPI.getStatus();
      setSystemStatus({
        loading: false,
        data: response.data.data,
        error: null
      });
    } catch (error) {
      setSystemStatus({
        loading: false,
        data: null,
        error: error.response?.data?.message || 'Failed to fetch system status'
      });
    }
  };

  const handleEmailTest = async (e) => {
    e.preventDefault();
    
    if (!emailTest.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTest.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailTest(prev => ({ ...prev, loading: true, result: null }));

    try {
      const response = await systemAPI.testEmail({ 
        email: emailTest.email.toLowerCase().trim() 
      });

      if (response.data.success) {
        setEmailTest(prev => ({
          ...prev,
          loading: false,
          result: {
            success: true,
            message: response.data.message,
            details: response.data.data
          }
        }));
        toast.success('Test email sent successfully!');
      } else {
        setEmailTest(prev => ({
          ...prev,
          loading: false,
          result: {
            success: false,
            message: response.data.message || 'Email test failed'
          }
        }));
        toast.error('Email test failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send test email';
      setEmailTest(prev => ({
        ...prev,
        loading: false,
        result: {
          success: false,
          message: errorMessage,
          error: error.response?.data?.data?.error
        }
      }));
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'configured':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'configured_but_unreachable':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'not_configured':
      case 'unhealthy':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'configured':
        return 'text-green-600 bg-green-50';
      case 'configured_but_unreachable':
        return 'text-yellow-600 bg-yellow-50';
      case 'not_configured':
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const openEmailAllModal = async () => {
    setEmailAll(prev => ({ ...prev, showModal: true, loadingCount: true, count: null }));
    try {
      const res = await systemAPI.getAssociatesEmailCount();
      const count = res.data?.data?.count ?? 0;
      setEmailAll(prev => ({ ...prev, count, loadingCount: false }));
    } catch (err) {
      setEmailAll(prev => ({ ...prev, loadingCount: false, count: 0 }));
      const msg = err.response?.data?.message || err.message || 'Could not load associate count';
      toast.error(msg);
    }
  };

  const closeEmailAllModal = () => {
    setEmailAll({ showModal: false, subject: '', content: '', count: null, loadingCount: false, sending: false });
  };

  const handleEmailAllAssociates = async (e) => {
    e.preventDefault();
    if (!emailAll.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    setEmailAll(prev => ({ ...prev, sending: true }));
    try {
      const res = await systemAPI.emailAllAssociates({
        subject: emailAll.subject.trim(),
        content: emailAll.content.trim()
      });
      toast.success(res.data?.message || 'Emails sent successfully');
      closeEmailAllModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setEmailAll(prev => ({ ...prev, sending: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
          <ServerIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600">Monitor system health and test configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
            <button
              onClick={fetchSystemStatus}
              disabled={systemStatus.loading}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {systemStatus.loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {systemStatus.loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : systemStatus.error ? (
            <div className="text-center py-8">
              <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{systemStatus.error}</p>
            </div>
          ) : systemStatus.data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Environment</span>
                <span className="text-sm text-gray-900 font-mono">
                  {systemStatus.data.environment}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(systemStatus.data.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Services</h3>
                {systemStatus.data.services && Object.entries(systemStatus.data.services).map(([service, status]) => {
                  const isOauthOptional = service === 'oauth';
                  const statusColor = isOauthOptional && status === 'not_configured' ? 'text-gray-600 bg-gray-100' : getStatusColor(status);
                  const statusIcon = isOauthOptional && status === 'not_configured' ? <ClockIcon className="h-5 w-5 text-gray-400" /> : getStatusIcon(status);
                  return (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {statusIcon}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {service.replace('_', ' ')}{isOauthOptional ? ' (optional)' : ''}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Email Configuration Test */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email Configuration Test</h2>
          </div>

          <form onSubmit={handleEmailTest} className="space-y-4">
            <div>
              <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                id="test-email"
                type="email"
                value={emailTest.email}
                onChange={(e) => setEmailTest(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter email address to test"
                disabled={emailTest.loading}
              />
            </div>

            <button
              type="submit"
              disabled={emailTest.loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {emailTest.loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending Test Email...
                </>
              ) : (
                'Send Test Email'
              )}
            </button>
          </form>

          {/* Test Result */}
          {emailTest.result && (
            <div className={`mt-4 p-4 rounded-lg ${
              emailTest.result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {emailTest.result.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    emailTest.result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {emailTest.result.message}
                  </p>
                  
                  {emailTest.result.details && (
                    <div className="mt-2 text-xs text-green-700">
                      <p>Recipient: {emailTest.result.details.recipient}</p>
                      <p>SMTP Server: {emailTest.result.details.smtpServer}</p>
                      <p>Timestamp: {new Date(emailTest.result.details.timestamp).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {emailTest.result.error && (
                    <p className="mt-2 text-xs text-red-700">
                      Error: {emailTest.result.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Configuration Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">About Email Testing</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tests SMTP connection and authentication</li>
              <li>• Sends a professional test email with system info</li>
              <li>• Verifies email templates are working correctly</li>
              <li>• Check your inbox and spam folder</li>
            </ul>
          </div>
        </div>

        {/* Email All Associates */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <UserGroupIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email All Associates</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Send an email to all active associates from your configured admin/SMTP address. Use this for announcements, offers, or updates.
          </p>
          <button
            type="button"
            onClick={openEmailAllModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Compose & Send
          </button>
        </div>
      </div>

      {/* Compose Email to All Associates Modal */}
      {emailAll.showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEmailAllModal} aria-hidden="true" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEmailAllAssociates}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email All Associates</h3>
                  {emailAll.loadingCount ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <LoadingSpinner size="sm" />
                      Loading recipient count...
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mb-4">
                      This email will be sent to <strong>{emailAll.count ?? 0} associate(s)</strong> (active, with email on file).
                    </p>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="broadcast-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <input
                        id="broadcast-subject"
                        type="text"
                        value={emailAll.subject}
                        onChange={(e) => setEmailAll(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g. New offers this month"
                        required
                        disabled={emailAll.sending}
                      />
                    </div>
                    <div>
                      <label htmlFor="broadcast-content" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        id="broadcast-content"
                        rows={6}
                        value={emailAll.content}
                        onChange={(e) => setEmailAll(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Write your message here. It will be sent as the email body to all associates."
                        disabled={emailAll.sending}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={emailAll.sending || (emailAll.count !== null && emailAll.count === 0)}
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {emailAll.sending ? 'Sending...' : 'Send to All'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEmailAllModal}
                    disabled={emailAll.sending}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
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

export default SystemManagement;