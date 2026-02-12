import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { leadsAPI } from '../../services/api';
import { validateEmail, validatePhone } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AddLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    numberOfPeople: 1,
    visitingDate: '',
    visitingLocation: '',
    currentLocation: '',
    clientBudget: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Optional email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Number of people validation
    if (formData.numberOfPeople < 1 || formData.numberOfPeople > 50) {
      newErrors.numberOfPeople = 'Number of people must be between 1 and 50';
    }

    // Budget validation
    if (formData.clientBudget && (isNaN(formData.clientBudget) || parseFloat(formData.clientBudget) < 0)) {
      newErrors.clientBudget = 'Please enter a valid budget amount';
    }

    // Visiting date validation
    if (formData.visitingDate) {
      const selectedDate = new Date(formData.visitingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.visitingDate = 'Travel date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        clientBudget: formData.clientBudget ? parseFloat(formData.clientBudget) : null,
        numberOfPeople: parseInt(formData.numberOfPeople),
        packageType: formData.packageType || null // Send null if not selected
      };

      await leadsAPI.create(submitData);
      toast.success('Lead added successfully!');
      navigate('/my-leads');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Lead</h1>
        <p className="text-sm sm:text-base text-gray-600">Fill in the customer details to create a new lead.</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Customer Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.customerName ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.phone ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">
                  Number of People *
                </label>
                <div className={`mt-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white ${
                  errors.numberOfPeople ? 'border-red-300' : 'border-gray-300'
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
                {errors.numberOfPeople && (
                  <p className="mt-1 text-sm text-red-600">{errors.numberOfPeople}</p>
                )}
              </div>
            </div>
          </div>

          {/* Travel Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="visitingLocation" className="block text-sm font-medium text-gray-700">
                  Travel Destination
                </label>
                <input
                  type="text"
                  id="visitingLocation"
                  name="visitingLocation"
                  value={formData.visitingLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Where do they want to visit?"
                />
              </div>

              <div>
                <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700">
                  Current City/Location
                </label>
                <input
                  type="text"
                  id="currentLocation"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Where are they from?"
                />
              </div>

              <div>
                <label htmlFor="visitingDate" className="block text-sm font-medium text-gray-700">
                  Travel Date
                </label>
                <input
                  type="date"
                  id="visitingDate"
                  name="visitingDate"
                  value={formData.visitingDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.visitingDate ? 'border-red-300' : ''
                  }`}
                />
                {errors.visitingDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitingDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="clientBudget" className="block text-sm font-medium text-gray-700">
                  Client Budget (₹)
                </label>
                <input
                  type="number"
                  id="clientBudget"
                  name="clientBudget"
                  value={formData.clientBudget}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.clientBudget ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter budget amount"
                />
                {errors.clientBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientBudget}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
              Details
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={4}
              value={formData.remarks}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Any additional details..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Lead...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLead;