import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated, isAdmin, isAssociate, getUser } from './utils/auth';
import { useSocket } from './hooks/useSocket';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import SetNewPassword from './pages/auth/SetNewPassword';
import ChangePassword from './pages/auth/ChangePassword';

// Associate Pages
import AssociateDashboard from './pages/associate/Dashboard';
import AddLead from './pages/associate/AddLead';
import MyLeads from './pages/associate/MyLeads';
import MyCommission from './pages/associate/MyCommission';
import CommissionPolicy from './pages/associate/CommissionPolicy';
import PackageShowcase from './pages/associate/PackageShowcase';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AllLeads from './pages/admin/AllLeads';
import AllAssociates from './pages/admin/AllAssociates';
import PendingApprovals from './pages/admin/PendingApprovals';
import Packages from './pages/admin/Packages';
import CommissionPayments from './pages/admin/CommissionPayments';
import PackageImages from './pages/admin/PackageImages';
import AdminCommissionPolicy from './pages/admin/CommissionPolicy';
import Notifications from './pages/admin/Notifications';
import SystemManagement from './pages/admin/SystemManagement';

// Public Pages
import AssociateRegistration from './pages/public/AssociateRegistration';
import LandingPage from './pages/public/LandingPage';
import Profile from './pages/Profile';

// Role-based Route Component
const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const isAuth = isAuthenticated();
  const user = getUser();
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.requiresPasswordChange && user?.role === 'associate') {
    return <Navigate to="/set-new-password" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuth = isAuthenticated();
  const userIsAdmin = isAdmin();
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !userIsAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const user = getUser();
  const userIsAdmin = isAdmin();
  
  if (isAuth) {
    if (user?.requiresPasswordChange) return <Navigate to="/set-new-password" replace />;
    return <Navigate to={userIsAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  
  return children;
};

// Set new password (first-time associate login) – must be logged in and have requiresPasswordChange
const SetNewPasswordRoute = () => {
  const isAuth = isAuthenticated();
  const user = getUser();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (!user?.requiresPasswordChange) return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <SetNewPassword />;
};

// Change password – associate clicks "Reset Password" in profile dropdown
const ChangePasswordRoute = () => {
  const isAuth = isAuthenticated();
  const user = getUser();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.role !== 'associate') return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return <ChangePassword />;
};

// Socket Connection Component - useSocket() establishes connection when authenticated
const SocketConnection = () => {
  useSocket();
  return null;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }}
        />
        
        {/* Socket Connection */}
        {isAuthenticated() && <SocketConnection />}
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Reset Password Route */}
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />
          
          {/* Set new password (first-time associate login with temp password) */}
          <Route path="/set-new-password" element={<SetNewPasswordRoute />} />
          
          {/* Change password (associate clicks Reset Password in profile menu) */}
          <Route path="/change-password" element={<ChangePasswordRoute />} />
          
          {/* Public Landing Page */}
          <Route 
            path="/home" 
            element={<LandingPage />} 
          />
          
          {/* Public Associate Registration */}
          <Route 
            path="/register" 
            element={<AssociateRegistration />} 
          />
          
          {/* Protected Routes with Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on role */}
            <Route 
              index 
              element={
                <Navigate 
                  to={isAdmin() ? "/admin/dashboard" : "/dashboard"} 
                  replace 
                />
              } 
            />
            
            {/* Associate Routes */}
            <Route 
              path="dashboard" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <AssociateDashboard />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="add-lead" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <AddLead />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="my-leads" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <MyLeads />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="my-commission" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <MyCommission />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="commission-policy" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <CommissionPolicy />
                </RoleBasedRoute>
              } 
            />
            <Route 
              path="packages-showcase" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <PackageShowcase />
                </RoleBasedRoute>
              }
            />
            <Route 
              path="notifications" 
              element={
                <RoleBasedRoute allowedRoles={['associate']}>
                  <Notifications />
                </RoleBasedRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route 
              path="admin/dashboard" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/leads" 
              element={
                <ProtectedRoute adminOnly>
                  <AllLeads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/associates" 
              element={
                <ProtectedRoute adminOnly>
                  <AllAssociates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/pending-approvals" 
              element={
                <ProtectedRoute adminOnly>
                  <PendingApprovals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/packages" 
              element={
                <ProtectedRoute adminOnly>
                  <Packages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/commission-payments" 
              element={
                <ProtectedRoute adminOnly>
                  <CommissionPayments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/package-images" 
              element={
                <ProtectedRoute adminOnly>
                  <PackageImages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/commission-policy" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminCommissionPolicy />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/notifications" 
              element={
                <ProtectedRoute adminOnly>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/system-management" 
              element={
                <ProtectedRoute adminOnly>
                  <SystemManagement />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={isAuthenticated() ? (isAdmin() ? "/admin/dashboard" : "/dashboard") : "/login"} 
                replace 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;