import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { publicAPI } from '../../services/api';
import Logo from '../../components/common/Logo';

const AssociateRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Please enter a valid 10-digit phone number';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Please enter a valid 6-digit pincode';
    if (!formData.accountNumber.trim()) errors.accountNumber = 'Account number is required';
    else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) errors.accountNumber = 'Account number should be 9-18 digits';
    if (!formData.ifscCode.trim()) errors.ifscCode = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) errors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    if (!formData.upiId.trim()) errors.upiId = 'UPI ID is required';
    else if (!/@/.test(formData.upiId)) errors.upiId = 'Please enter a valid UPI ID (e.g., name@paytm)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await publicAPI.register(formData);
      setRegistrationSuccess(true);
      setRegistrationData(response.data);
      toast.success('Registration successful! Please wait for admin approval.');
      setTimeout(() => document.getElementById('success-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
      accountNumber: '', ifscCode: '', upiId: '',
    });
    setFormErrors({});
    setRegistrationSuccess(false);
    setRegistrationData(null);
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 ${
      hasError ? 'border-rose-300' : 'border-slate-200'
    }`;

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';
  const sectionTitleClass = 'font-display text-xl font-semibold text-slate-900 flex items-center gap-2';

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div id="success-section" className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-8 py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-white tracking-tight mb-2">
                Registration Successful
              </h2>
              <p className="text-primary-100 text-lg">
                Thank you for joining OffbeatTrips
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3">Your application details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="text-slate-900 font-medium">{registrationData?.associate?.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="text-slate-900 font-medium">{registrationData?.associate?.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Unique ID</dt><dd className="text-slate-900 font-medium">{registrationData?.associate?.uniqueId}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="text-amber-600 font-medium">Pending approval</dd></div>
                </dl>
              </div>
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <InformationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {registrationData?.nextSteps?.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span> {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg shadow-primary-900/20"
                >
                  Register another associate
                </button>
                <Link
                  to="/login"
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-center text-primary-600 border-2 border-primary-200 hover:bg-primary-50 transition-all duration-200"
                >
                  Go to sign in
                </Link>
              </div>
              <p className="text-center text-sm text-slate-500 pt-2">
                Need help? <a href="mailto:ops@offbeattrips.in" className="text-primary-600 hover:underline">ops@offbeattrips.in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h80v80H0z' fill='none'/%3E%3Cpath d='M40 0L80 40 40 80 0 40z' fill='%23fff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center p-1 shadow-lg shadow-black/10 ring-1 ring-white/50">
              <Logo size="xl" showText={false} variant="icon-only" className="w-full h-full min-w-0 min-h-0 rounded-full overflow-hidden [&_img]:object-cover [&_img]:rounded-full" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Join OffbeatTrips as a Business Associate
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Start your journey with us. Register now to become a business associate and earn commissions on every successful trip.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: CurrencyDollarIcon, title: 'Earn commissions', desc: '3–5% commission on every successful trip booking', accent: 'from-emerald-500 to-teal-600' },
            { icon: ChartBarIcon, title: 'Easy management', desc: 'Simple dashboard to manage leads and track earnings', accent: 'from-primary-500 to-primary-600' },
            { icon: UserGroupIcon, title: 'Full support', desc: 'Dedicated support from our team for all your queries', accent: 'from-violet-500 to-purple-600' },
          ].map(({ icon: Icon, title, desc, accent }) => (
            <div key={title} className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 text-center hover:shadow-xl hover:shadow-slate-200/60 transition-shadow duration-300">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${accent} text-white mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-2">Registration</h2>
            <p className="text-slate-600 text-sm">Register instantly with Google or complete the form below.</p>
            <button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-white text-sm text-slate-500">or register manually</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
            {/* Personal */}
            <div>
              <h3 className={sectionTitleClass}>
                <UserPlusIcon className="w-6 h-6 text-primary-600" />
                Personal information
              </h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-name" className={labelClass}>Full name *</label>
                  <input id="reg-name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className={inputClass(formErrors.name)} />
                  {formErrors.name && <p className="mt-1.5 text-sm text-rose-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="reg-email" className={labelClass}>Email address *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="reg-email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" className={`${inputClass(formErrors.email)} pl-11`} />
                  </div>
                  {formErrors.email && <p className="mt-1.5 text-sm text-rose-600">{formErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="reg-phone" className={labelClass}>Phone number *</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="reg-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" className={`${inputClass(formErrors.phone)} pl-11`} />
                  </div>
                  {formErrors.phone && <p className="mt-1.5 text-sm text-rose-600">{formErrors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className={sectionTitleClass}>
                <MapPinIcon className="w-6 h-6 text-primary-600" />
                Address
              </h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="reg-address" className={labelClass}>Address *</label>
                  <textarea id="reg-address" name="address" value={formData.address} onChange={handleInputChange} rows={3} placeholder="Enter your complete address" className={inputClass(formErrors.address)} />
                  {formErrors.address && <p className="mt-1.5 text-sm text-rose-600">{formErrors.address}</p>}
                </div>
                <div>
                  <label htmlFor="reg-city" className={labelClass}>City *</label>
                  <input id="reg-city" type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputClass(formErrors.city)} />
                  {formErrors.city && <p className="mt-1.5 text-sm text-rose-600">{formErrors.city}</p>}
                </div>
                <div>
                  <label htmlFor="reg-state" className={labelClass}>State *</label>
                  <input id="reg-state" type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className={inputClass(formErrors.state)} />
                  {formErrors.state && <p className="mt-1.5 text-sm text-rose-600">{formErrors.state}</p>}
                </div>
                <div>
                  <label htmlFor="reg-pincode" className={labelClass}>Pincode *</label>
                  <input id="reg-pincode" type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="123456" className={inputClass(formErrors.pincode)} />
                  {formErrors.pincode && <p className="mt-1.5 text-sm text-rose-600">{formErrors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Bank */}
            <div>
              <h3 className={sectionTitleClass}>
                <CreditCardIcon className="w-6 h-6 text-primary-600" />
                Bank information
              </h3>
              <div className="mt-4 flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <ExclamationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">Your bank details are required for commission payments. All information is kept secure and confidential.</p>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-accountNumber" className={labelClass}>Bank account number *</label>
                  <input id="reg-accountNumber" type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Enter account number" className={inputClass(formErrors.accountNumber)} />
                  {formErrors.accountNumber && <p className="mt-1.5 text-sm text-rose-600">{formErrors.accountNumber}</p>}
                </div>
                <div>
                  <label htmlFor="reg-ifscCode" className={labelClass}>IFSC code *</label>
                  <input id="reg-ifscCode" type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} className={inputClass(formErrors.ifscCode)} />
                  {formErrors.ifscCode && <p className="mt-1.5 text-sm text-rose-600">{formErrors.ifscCode}</p>}
                </div>
                <div>
                  <label htmlFor="reg-upiId" className={labelClass}>UPI ID *</label>
                  <input id="reg-upiId" type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} placeholder="yourname@paytm" className={inputClass(formErrors.upiId)} />
                  {formErrors.upiId && <p className="mt-1.5 text-sm text-rose-600">{formErrors.upiId}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[220px] py-3.5 px-8 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-900/20 transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Submitting…
                  </span>
                ) : (
                  'Submit registration'
                )}
              </button>
              <p className="mt-4 text-sm text-slate-500">
                By registering, you agree to our terms and conditions. All information will be verified by our admin team.
              </p>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AssociateRegistration;
