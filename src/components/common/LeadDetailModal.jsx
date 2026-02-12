import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../utils/helpers';
import StatusBadge from './StatusBadge';

const LeadDetailModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const fields = [
    { label: 'Customer Name', value: lead.customerName },
    { label: 'Phone', value: lead.phone },
    { label: 'Email', value: lead.email || '–' },
    { label: 'Number of People', value: lead.numberOfPeople ?? '–' },
    { label: 'Travel Date', value: lead.visitingDate ? formatDate(lead.visitingDate) : '–' },
    { label: 'Travel Destination', value: lead.visitingLocation || '–' },
    { label: 'Current Location', value: lead.currentLocation || '–' },
    { label: 'Budget', value: lead.clientBudget != null ? formatCurrency(lead.clientBudget) : '–' },
    { label: 'Package Type', value: lead.packageType || '–' },
    { label: 'Status', value: lead.status, isStatus: true },
    { label: 'Details', value: lead.remarks || '–' },
    { label: 'Created', value: lead.createdAt ? formatDate(lead.createdAt) : '–' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Lead Details
            </h3>
            <div className="space-y-3">
              {fields.map(({ label, value, isStatus }) => (
                <div key={label}>
                  <dt className="text-sm font-medium text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {isStatus && label === 'Status' ? (
                      <StatusBadge status={value} />
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
              {lead.attachmentUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Attachment</dt>
                  <dd className="mt-0.5">
                    <a
                      href={lead.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      View document
                    </a>
                  </dd>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
