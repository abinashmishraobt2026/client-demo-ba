import React, { useState, useEffect } from 'react';
import { 
  InformationCircleIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { commissionPoliciesAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CommissionPolicy = () => {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await commissionPoliciesAPI.getAll();
      const all = response.data.data || [];
      setPolicies(all.filter((p) => p.isActive !== false));
    } catch {
      toast.error('Failed to load commission policies');
    } finally {
      setLoading(false);
    }
  };

  const getPolicyIcon = (packageType) => {
    switch (packageType) {
      case 'Domestic':
        return <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />;
      case 'International':
        return <GlobeAltIcon className="h-8 w-8 text-green-500" />;
      case 'Resort':
        return <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />;
      default:
        return <CurrencyDollarIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPolicyColor = (packageType) => {
    switch (packageType) {
      case 'Domestic':
        return 'border-blue-200 bg-blue-50';
      case 'International':
        return 'border-green-200 bg-green-50';
      case 'Resort':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commission Policy</h1>
        <p className="text-gray-600">Understand how your commission is calculated</p>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div
            key={policy.packageType}
            className={`rounded-lg border-2 p-6 ${getPolicyColor(policy.packageType)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getPolicyIcon(policy.packageType)}
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  {policy.packageType} Package
                </h3>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Number(policy.commissionPercent)}%
              </div>
              <p className="text-sm text-gray-600">Commission Rate</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Example:</strong> On a ₹10,000 package
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>₹10,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission ({Number(policy.commissionPercent)}%):</span>
                    <span>₹{(10000 * Number(policy.commissionPercent) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Final Price:</span>
                    <span>₹{(10000 + (10000 * Number(policy.commissionPercent) / 100)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              How Commission Works
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Commission is automatically calculated based on package type</li>
                <li>Commission amount is added to the base package price</li>
                <li>Final price includes both base amount and your commission</li>
                <li>Commission becomes eligible for payment once the trip is completed</li>
                <li>Admin approval is required for all package final prices</li>
                <li>Payment amount must exactly match the commission amount</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Calculation Formula
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center space-y-2">
              <div className="text-lg font-mono">
                <span className="text-blue-600">Commission Amount</span> = 
                <span className="text-green-600"> Base Amount</span> × 
                <span className="text-purple-600"> Policy %</span> ÷ 100
              </div>
              <div className="text-lg font-mono">
                <span className="text-orange-600">Final Package Price</span> = 
                <span className="text-green-600"> Base Amount</span> + 
                <span className="text-blue-600"> Commission Amount</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Commission policies are set by the admin and may be updated from time to time. 
              Always refer to the current policy rates when calculating commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionPolicy;