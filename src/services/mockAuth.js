// Mock Authentication Service - Simulates backend authentication
import toast from 'react-hot-toast';

// Demo users stored in memory
const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@offbeattrips.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    uniqueId: 'ADMIN-001',
    requiresPasswordChange: false,
    phone: '+91 98765 00000',
    address: 'OffbeatTrips HQ, Mumbai, Maharashtra',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    profilePicture: ''
  },
  {
    id: 2,
    email: 'associate@offbeattrips.com',
    password: 'associate123',
    name: 'John Associate',
    role: 'associate',
    uniqueId: 'BA-001',
    requiresPasswordChange: false,
    phone: '+91 98765 00001',
    address: 'Andheri West, Mumbai, Maharashtra 400058',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    profilePicture: '',
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      upiId: 'john@paytm'
    }
  },
  {
    id: 3,
    email: 'demo@offbeattrips.com',
    password: 'demo123',
    name: 'Demo Associate',
    role: 'associate',
    uniqueId: 'BA-002',
    requiresPasswordChange: false,
    phone: '+91 98765 00002',
    address: 'Koramangala, Bangalore, Karnataka 560034',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    profilePicture: '',
    bankDetails: {
      accountNumber: '9876543210',
      ifscCode: 'ICIC0001234',
      upiId: 'demo@oksbi'
    }
  }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
  login: async (credentials) => {
    await delay();
    
    const { identifier, password } = credentials;
    
    // Find user by email or uniqueId
    const user = DEMO_USERS.find(
      u => u.email === identifier || u.uniqueId === identifier
    );
    
    if (!user || user.password !== password) {
      throw {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };
    }
    
    // Generate mock token
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    return {
      data: {
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            uniqueId: user.uniqueId
          },
          requiresPasswordChange: user.requiresPasswordChange
        }
      }
    };
  },
  
  forgotPassword: async (data) => {
    await delay();
    toast.success('Password reset link sent to your email (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  resetPassword: async (data) => {
    await delay();
    toast.success('Password reset successfully (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  }
};

export const mockPasswordAPI = {
  changePassword: async (data) => {
    await delay();
    toast.success('Password changed successfully (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  resetPassword: async (data) => {
    await delay();
    toast.success('Password reset successfully (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  setInitialPassword: async (data) => {
    await delay();
    toast.success('Password set successfully (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  getProfile: async () => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get full user data from DEMO_USERS if available
    const DEMO_USERS = [
      {
        id: 1,
        email: 'admin@offbeattrips.com',
        name: 'Admin User',
        role: 'admin',
        uniqueId: 'ADMIN-001',
        phone: '+91 98765 00000',
        address: 'OffbeatTrips HQ, Mumbai, Maharashtra',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: ''
      },
      {
        id: 2,
        email: 'associate@offbeattrips.com',
        name: 'John Associate',
        role: 'associate',
        uniqueId: 'BA-001',
        phone: '+91 98765 00001',
        address: 'Andheri West, Mumbai, Maharashtra 400058',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234',
          upiId: 'john@paytm'
        }
      },
      {
        id: 3,
        email: 'demo@offbeattrips.com',
        name: 'Demo Associate',
        role: 'associate',
        uniqueId: 'BA-002',
        phone: '+91 98765 00002',
        address: 'Koramangala, Bangalore, Karnataka 560034',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        profilePicture: '',
        bankDetails: {
          accountNumber: '9876543210',
          ifscCode: 'ICIC0001234',
          upiId: 'demo@oksbi'
        }
      }
    ];
    
    const fullUser = DEMO_USERS.find(u => u.id === user.id) || user;
    
    return { 
      data: { 
        data: { 
          profile: fullUser 
        } 
      } 
    };
  },
  
  updateProfile: async (data) => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    toast.success('Profile updated successfully');
    return { 
      data: { 
        data: { 
          profile: updated 
        } 
      } 
    };
  },
  
  deactivateAccount: async () => {
    await delay();
    toast.success('Account deactivated (Demo mode)');
    return { data: { message: 'Success' } };
  }
};

export const mockPublicAPI = {
  register: async (data) => {
    await delay();
    toast.success('Registration submitted! Admin will review your application (Demo mode)');
    return { data: { message: 'Success' } };
  },
  
  checkStatus: async (email) => {
    await delay();
    return { 
      data: { 
        status: 'pending',
        message: 'Your application is under review' 
      } 
    };
  }
};
