import React from 'react';
import { getStatusColor, getStatusText } from '../../utils/helpers';

const StatusBadge = ({ status, className = '' }) => {
  const colorClass = getStatusColor(status);
  const displayText = getStatusText(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;