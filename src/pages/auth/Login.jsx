import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../../services/api';
import { setAuth, isAdmin } from '../../utils/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Logo from '../../components/common/Logo';
import ForgotPasswordModal from '../../components/common/ForgotPasswordModal';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [welcomeReveal, setWelcomeReveal] = useState({ hovered: false, revealed: 3, tick: 0 });
  const [logoBounce, setLogoBounce] = useState(false);
  const welcomeIntervalRef = useRef(null);
  const hexIntervalRef = useRef(null);

  const handleLogoClick = () => {
    if (logoBounce) return;
    setLogoBounce(true);
    setTimeout(() => setLogoBounce(false), 600);
  };

  const WELCOME_WORDS = ['Welcome', 'to', 'OffbeatTrips', 'Business', 'Associate', 'Portal'];
  const HEX = '0123456789ABCDEF';

  const randomHexStr = (len) => {
    let s = '';
    for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
    return s;
  };

  useEffect(() => {
    // No OAuth callback handling in static demo version
  }, []);

  useEffect(() => {
    if (!welcomeReveal.hovered) {
      if (welcomeIntervalRef.current) clearInterval(welcomeIntervalRef.current);
      if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
      setWelcomeReveal((p) => ({ ...p, revealed: 6, tick: 0 }));
      return;
    }
    setWelcomeReveal((p) => ({ ...p, revealed: 0, tick: 0 }));
    hexIntervalRef.current = setInterval(() => {
      setWelcomeReveal((p) => ({ ...p, tick: p.tick + 1 }));
    }, 80);
    let step = 0;
    const delay = 180;
    welcomeIntervalRef.current = setInterval(() => {
      step += 1;
      if (step >= 6) {
        clearInterval(welcomeIntervalRef.current);
        if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
        setWelcomeReveal((p) => ({ ...p, revealed: 6 }));
        return;
      }
      setWelcomeReveal((p) => ({ ...p, revealed: step }));
    }, delay);
    return () => {
      if (welcomeIntervalRef.current) clearInterval(welcomeIntervalRef.current);
      if (hexIntervalRef.current) clearInterval(hexIntervalRef.current);
    };
  }, [welcomeReveal.hovered]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = 'Email or Unique ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await authAPI.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      const { token, user, requiresPasswordChange } = response.data.data;
      setAuth(token, { ...user, requiresPasswordChange: !!requiresPasswordChange });
      toast.success(`Welcome back, ${user.name}!`);
      if (requiresPasswordChange) {
        navigate('/set-new-password', { replace: true });
        return;
      }
      navigate(isAdmin() ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-yellow-500/20">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Card - middle */}
      <div className="relative w-full max-w-md lg:max-w-4xl bg-white rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left - Welcome (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 lg:p-10 items-center justify-center relative overflow-hidden">
            {/* Colorful bubbles */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-25" />
            <div className="absolute top-32 right-16 w-14 h-14 bg-green-400 rounded-full opacity-30" />
            <div className="absolute bottom-24 left-20 w-16 h-16 bg-orange-400 rounded-full opacity-30" />
            <div className="absolute bottom-32 right-10 w-10 h-10 bg-pink-400 rounded-full opacity-40" />
            <div className="absolute top-1/2 left-8 w-12 h-12 bg-amber-300 rounded-full opacity-20" />
            <div className="absolute top-20 right-1/3 w-8 h-8 bg-cyan-300 rounded-full opacity-25" />
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='%23fff' fill-opacity='0.05'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -left-6 bg-white/10 backdrop-blur-sm rounded-lg p-3 transform rotate-12 z-10">
              <div className="w-8 h-6 bg-white/30 rounded" />
              <div className="w-6 h-1 bg-white/20 rounded mt-1" />
              <div className="w-4 h-1 bg-white/20 rounded mt-1" />
            </div>
            <div className="absolute top-8 -right-4 bg-yellow-400/20 backdrop-blur-sm rounded-lg p-2 transform -rotate-6 z-10">
              <div className="w-6 h-6 bg-yellow-400/40 rounded-full" />
            </div>
            <div className="absolute bottom-16 -right-6 bg-green-400/20 backdrop-blur-sm rounded-lg p-3 transform rotate-6 z-10">
              <span className="text-xs font-bold text-white/80">₹</span>
            </div>
            <div className="relative z-10 text-center text-white">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={handleLogoClick}
                    className={`group relative w-16 h-16 rounded-full cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary-700 overflow-hidden ${
                      logoBounce ? 'animate-logo-bounce' : ''
                    }`}
                    aria-label="Logo"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-yellow-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center p-1 shadow-lg shadow-black/10 ring-1 ring-white/50 group-hover:shadow-xl group-hover:shadow-amber-900/10 group-hover:ring-amber-200/50 transition-all duration-300">
                      <Logo size="xl" showText={false} variant="icon-only" className="w-full h-full min-w-0 min-h-0 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110 [&_img]:object-cover [&_img]:rounded-full" />
                    </div>
                  </button>
                </div>
                <h2
                  className="text-2xl lg:text-3xl font-bold mb-2 animate-slide-in-left font-mono cursor-default select-none leading-tight"
                  onMouseEnter={() => setWelcomeReveal((p) => ({ ...p, hovered: true }))}
                  onMouseLeave={() => setWelcomeReveal((p) => ({ ...p, hovered: false }))}
                >
                  {WELCOME_WORDS.map((word, i) => (
                    <span key={i}>
                      {i > 0 && ' '}
                      {welcomeReveal.hovered && i >= welcomeReveal.revealed
                        ? randomHexStr(word.length)
                        : word}
                    </span>
                  ))}
                </h2>
                <p className="text-primary-100 text-sm leading-relaxed animate-slide-in-left" style={{ animationDelay: '0.12s', animationFillMode: 'backwards' }}>
                  Track leads, monitor commissions & grow your travel business.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <Logo size="sm" showText={true} />
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600">Don&apos;t have an account?</p>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-500 inline-flex items-center mt-0.5"
                >
                  <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  Create an account
                </Link>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Login to Partner Portal</h2>
            <p className="text-sm text-gray-600 mb-6">Enter your credentials to access your dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Unique ID
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="name@example.com or BA-XXXXX"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-base ${
                    errors.identifier ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.identifier && <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-base ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    LOG IN
                  </div>
                ) : (
                  'LOG IN'
                )}
              </button>

              {/* Demo Credentials Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-blue-800">
                  <p><strong>Admin:</strong> admin@offbeattrips.com / admin123</p>
                  <p><strong>Associate:</strong> associate@offbeattrips.com / associate123</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  );
};

export default Login;
