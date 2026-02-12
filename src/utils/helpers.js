// Helper utility functions

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    // Lead statuses
    'NotAnswer': 'bg-gray-100 text-gray-800',
    'NotInterested': 'bg-red-100 text-red-800',
    'NotDecide': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-green-100 text-green-800',
    'TripCancelled': 'bg-red-100 text-red-800',
    'TripCompleted': 'bg-emerald-100 text-emerald-800',
    
    // Package statuses
    'Draft': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'TripComplete': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    
    // Payment statuses
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    
    // User statuses
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800',
    'Pending Approval': 'bg-yellow-100 text-yellow-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status) => {
  const statusTexts = {
    'NotAnswer': 'No Answer',
    'NotInterested': 'Not Interested',
    'NotDecide': 'Not Decided',
    'Confirmed': 'Confirmed',
    'TripCancelled': 'Trip Cancelled',
    'TripCompleted': 'Trip Completed',
    'Draft': 'Draft',
    'Approved': 'Approved',
    'TripComplete': 'Trip Complete',
    'Cancelled': 'Cancelled',
    'Paid': 'Paid',
    'Pending': 'Pending',
    'Active': 'Active',
    'Inactive': 'Inactive',
    'Pending Approval': 'Pending Approval',
  };
  
  return statusTexts[status] || status;
};

export const calculateCommission = (baseAmount, commissionPercent) => {
  if (!baseAmount || !commissionPercent) return { commissionAmount: 0, finalAmount: baseAmount || 0 };
  
  const commissionAmount = (baseAmount * commissionPercent) / 100;
  const finalAmount = baseAmount + commissionAmount;
  
  return {
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
  };
};

export const getCommissionPolicyRate = (packageType) => {
  const rates = {
    'Domestic': 3,
    'International': 5,
    'Resort': 3,
  };
  
  return rates[packageType] || 0;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indian phone numbers
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return phone;
};