// Mock Data Service - Simulates backend data operations
import toast from 'react-hot-toast';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize mock data in localStorage
const initMockData = () => {
  if (!localStorage.getItem('mockLeads')) {
    const mockLeads = [
      {
        id: 1,
        customerName: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        email: 'rajesh@example.com',
        visitingLocation: 'Manali, Himachal Pradesh',
        numberOfPeople: 4,
        clientBudget: 50000,
        status: 'Active',
        associateId: 2,
        associateName: 'John Associate',
        associateUniqueId: 'BA-001',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        customerName: 'Priya Sharma',
        phone: '+91 87654 32109',
        email: 'priya@example.com',
        visitingLocation: 'Goa Beaches',
        numberOfPeople: 2,
        clientBudget: 30000,
        status: 'Confirmed',
        associateId: 2,
        associateName: 'John Associate',
        associateUniqueId: 'BA-001',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        customerName: 'Amit Patel',
        phone: '+91 76543 21098',
        email: 'amit@example.com',
        visitingLocation: 'Ladakh Adventure',
        numberOfPeople: 6,
        clientBudget: 120000,
        status: 'Pending',
        associateId: 3,
        associateName: 'Demo Associate',
        associateUniqueId: 'BA-002',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
  }
  
  if (!localStorage.getItem('mockAssociates')) {
    const mockAssociates = [
      {
        id: 2,
        name: 'John Associate',
        email: 'associate@offbeattrips.com',
        phone: '+91 98765 00001',
        uniqueId: 'BA-001',
        status: 'active',
        approvalStatus: 'approved',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Demo Associate',
        email: 'demo@offbeattrips.com',
        phone: '+91 98765 00002',
        uniqueId: 'BA-002',
        status: 'active',
        approvalStatus: 'approved',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('mockAssociates', JSON.stringify(mockAssociates));
  }
  
  if (!localStorage.getItem('mockPackages')) {
    const mockPackages = [
      {
        id: 1,
        name: 'Manali Adventure Package',
        description: '5 Days / 4 Nights adventure in Manali',
        price: 15000,
        duration: '5 Days',
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Goa Beach Retreat',
        description: '3 Days / 2 Nights beach vacation',
        price: 12000,
        duration: '3 Days',
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('mockPackages', JSON.stringify(mockPackages));
  }
  
  if (!localStorage.getItem('mockCommissions')) {
    const mockCommissions = [
      {
        id: 1,
        associateId: 2,
        leadId: 2,
        amount: 3000,
        status: 'paid',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('mockCommissions', JSON.stringify(mockCommissions));
  }
  
  if (!localStorage.getItem('mockNotifications')) {
    const mockNotifications = [
      {
        id: 1,
        title: 'Welcome to OffbeatTrips',
        message: 'Start adding leads and earning commissions!',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('mockNotifications', JSON.stringify(mockNotifications));
  }
};

// Initialize on load
initMockData();

// Helper to get data from localStorage
const getData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

// Helper to save data to localStorage
const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Associates API
export const mockAssociatesAPI = {
  create: async (data) => {
    await delay();
    const associates = getData('mockAssociates');
    const newAssociate = {
      ...data,
      id: Date.now(),
      uniqueId: `BA-${String(associates.length + 1).padStart(3, '0')}`,
      status: 'active',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    associates.push(newAssociate);
    saveData('mockAssociates', associates);
    toast.success('Associate created successfully');
    return { data: { data: newAssociate } };
  },
  
  getAll: async (params) => {
    await delay();
    const associates = getData('mockAssociates');
    return { data: { data: associates } };
  },
  
  getById: async (id) => {
    await delay();
    const associates = getData('mockAssociates');
    const associate = associates.find(a => a.id === parseInt(id));
    return { data: { data: associate } };
  },
  
  approve: async (id) => {
    await delay();
    const associates = getData('mockAssociates');
    const index = associates.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      associates[index].approvalStatus = 'approved';
      saveData('mockAssociates', associates);
      toast.success('Associate approved');
    }
    return { data: { data: associates[index] } };
  },
  
  toggleStatus: async (id, data) => {
    await delay();
    const associates = getData('mockAssociates');
    const index = associates.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      associates[index].status = data.status;
      saveData('mockAssociates', associates);
      toast.success('Status updated');
    }
    return { data: { data: associates[index] } };
  },
  
  resetPassword: async (id) => {
    await delay();
    toast.success('Password reset email sent (Demo mode)');
    return { data: { message: 'Success' } };
  }
};

// Leads API
export const mockLeadsAPI = {
  create: async (data) => {
    await delay();
    const leads = getData('mockLeads');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newLead = {
      ...data,
      id: Date.now(),
      associateId: user.id,
      associateName: user.name,
      associateUniqueId: user.uniqueId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    leads.push(newLead);
    saveData('mockLeads', leads);
    toast.success('Lead added successfully');
    return { data: { data: newLead } };
  },
  
  getAll: async (params) => {
    await delay();
    let leads = getData('mockLeads');
    
    // Apply filters
    if (params?.status) {
      leads = leads.filter(l => l.status === params.status);
    }
    
    // Apply pagination
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;
    const paginatedLeads = leads.slice(offset, offset + limit);
    
    return { 
      data: { 
        leads: paginatedLeads,
        data: { 
          leads: paginatedLeads,
          pagination: {
            totalCount: leads.length,
            hasMore: offset + limit < leads.length
          }
        }
      } 
    };
  },
  
  getMy: async (params) => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let leads = getData('mockLeads').filter(l => l.associateId === user.id);
    
    // Apply filters
    if (params?.status) {
      leads = leads.filter(l => l.status === params.status);
    }
    
    // Apply pagination
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;
    const paginatedLeads = leads.slice(offset, offset + limit);
    
    return { 
      data: { 
        leads: paginatedLeads,
        data: { 
          leads: paginatedLeads,
          pagination: {
            totalCount: leads.length,
            hasMore: offset + limit < leads.length
          }
        }
      } 
    };
  },
  
  getById: async (id) => {
    await delay();
    const leads = getData('mockLeads');
    const lead = leads.find(l => l.id === parseInt(id));
    return { data: { data: lead } };
  },
  
  update: async (id, data) => {
    await delay();
    const leads = getData('mockLeads');
    const index = leads.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      leads[index] = { ...leads[index], ...data, updatedAt: new Date().toISOString() };
      saveData('mockLeads', leads);
      toast.success('Lead updated successfully');
    }
    return { data: { data: leads[index] } };
  },
  
  updateStatus: async (id, data) => {
    await delay();
    const leads = getData('mockLeads');
    const index = leads.findIndex(l => l.id === parseInt(id));
    if (index !== -1) {
      leads[index].status = data.status;
      leads[index].updatedAt = new Date().toISOString();
      saveData('mockLeads', leads);
      toast.success('Status updated');
    }
    return { data: { data: leads[index] } };
  },
  
  delete: async (id) => {
    await delay();
    const leads = getData('mockLeads');
    const filtered = leads.filter(l => l.id !== parseInt(id));
    saveData('mockLeads', filtered);
    toast.success('Lead deleted');
    return { data: { message: 'Success' } };
  }
};

// Packages API
export const mockPackagesAPI = {
  create: async (data) => {
    await delay();
    const packages = getData('mockPackages');
    const newPackage = {
      ...data,
      id: Date.now(),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    packages.push(newPackage);
    saveData('mockPackages', packages);
    toast.success('Package created successfully');
    return { data: { data: newPackage } };
  },
  
  getAll: async (params) => {
    await delay();
    const packages = getData('mockPackages');
    return { data: { data: packages } };
  },
  
  getById: async (id) => {
    await delay();
    const packages = getData('mockPackages');
    const pkg = packages.find(p => p.id === parseInt(id));
    return { data: { data: pkg } };
  },
  
  updateStatus: async (id, data) => {
    await delay();
    const packages = getData('mockPackages');
    const index = packages.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      packages[index].status = data.status;
      saveData('mockPackages', packages);
      toast.success('Status updated');
    }
    return { data: { data: packages[index] } };
  },
  
  approve: async (id, data) => {
    await delay();
    toast.success('Package approved');
    return { data: { message: 'Success' } };
  }
};

// Commission API
export const mockCommissionAPI = {
  recordPayment: async (data) => {
    await delay();
    const commissions = getData('mockCommissions');
    const newCommission = {
      ...data,
      id: Date.now(),
      status: 'paid',
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    commissions.push(newCommission);
    saveData('mockCommissions', commissions);
    toast.success('Commission payment recorded');
    return { data: { data: newCommission } };
  },
  
  getPayments: async (params) => {
    await delay();
    const commissions = getData('mockCommissions');
    return { data: { data: commissions } };
  },
  
  getAssociateCommissions: async (id) => {
    await delay();
    const commissions = getData('mockCommissions').filter(c => c.associateId === parseInt(id));
    return { data: { data: commissions } };
  }
};

// Dashboard API
export const mockDashboardAPI = {
  getAssociateDashboard: async (id, params = {}) => {
    await delay();
    const leads = getData('mockLeads').filter(l => l.associateId === parseInt(id));
    const commissions = getData('mockCommissions').filter(c => c.associateId === parseInt(id));
    
    const totalCommissionPaid = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    
    const pendingCommission = leads
      .filter(l => l.status === 'Confirmed')
      .reduce((sum, l) => sum + ((l.clientBudget || 0) * 0.1), 0) - totalCommissionPaid;
    
    return {
      data: {
        data: {
          totalLeads: leads.length,
          summary: {
            totalLeads: leads.length,
            activeLeads: leads.filter(l => l.status === 'Active').length
          },
          totalCommissionPaid,
          pendingCommission: Math.max(0, pendingCommission)
        }
      }
    };
  },
  
  getAllAssociatesSummary: async (params = {}) => {
    await delay();
    const associates = getData('mockAssociates');
    const leads = getData('mockLeads');
    const packages = getData('mockPackages');
    const commissions = getData('mockCommissions');
    
    const totalCommissionPaid = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    
    return {
      data: {
        data: {
          associates,
          totals: {
            totalLeads: leads.length,
            activeLeads: leads.filter(l => l.status === 'Active').length,
            totalPackages: packages.length,
            totalCommissionPaid
          }
        }
      }
    };
  }
};

// Notifications API
export const mockNotificationsAPI = {
  getAll: async (params) => {
    await delay();
    const notifications = getData('mockNotifications');
    return { data: { data: notifications } };
  },
  
  markAsRead: async (id) => {
    await delay();
    const notifications = getData('mockNotifications');
    const index = notifications.findIndex(n => n.id === parseInt(id));
    if (index !== -1) {
      notifications[index].read = true;
      saveData('mockNotifications', notifications);
    }
    return { data: { message: 'Success' } };
  },
  
  markAllAsRead: async () => {
    await delay();
    const notifications = getData('mockNotifications');
    notifications.forEach(n => n.read = true);
    saveData('mockNotifications', notifications);
    return { data: { message: 'Success' } };
  },
  
  getUnreadCount: async () => {
    await delay();
    const notifications = getData('mockNotifications');
    const count = notifications.filter(n => !n.read).length;
    return { data: { data: { count } } };
  }
};

// Package Images API
export const mockPackageImagesAPI = {
  getAll: async (params) => {
    await delay();
    return { data: { data: [] } };
  },
  
  create: async (data) => {
    await delay();
    toast.success('Image uploaded (Demo mode)');
    return { data: { data: { id: Date.now(), ...data } } };
  },
  
  update: async (id, data) => {
    await delay();
    toast.success('Image updated');
    return { data: { message: 'Success' } };
  },
  
  delete: async (id) => {
    await delay();
    toast.success('Image deleted');
    return { data: { message: 'Success' } };
  },
  
  toggleStatus: async (id) => {
    await delay();
    toast.success('Status updated');
    return { data: { message: 'Success' } };
  }
};

// Commission Policies API
export const mockCommissionPoliciesAPI = {
  getAll: async () => {
    await delay();
    return { 
      data: { 
        data: [
          {
            id: 1,
            name: 'Standard Commission',
            rate: 10,
            description: '10% commission on confirmed bookings'
          }
        ] 
      } 
    };
  },
  
  update: async (id, data) => {
    await delay();
    toast.success('Policy updated');
    return { data: { message: 'Success' } };
  },
  
  create: async (data) => {
    await delay();
    toast.success('Policy created');
    return { data: { data: { id: Date.now(), ...data } } };
  }
};

// Upload API
export const mockUploadAPI = {
  commissionScreenshot: async (formData) => {
    await delay();
    toast.success('File uploaded (Demo mode)');
    return { data: { data: { url: 'https://via.placeholder.com/400', publicId: 'demo' } } };
  },
  
  packageImage: async (formData) => {
    await delay();
    toast.success('Image uploaded (Demo mode)');
    return { data: { data: { url: 'https://via.placeholder.com/400', publicId: 'demo' } } };
  },
  
  associateDocument: async (formData) => {
    await delay();
    toast.success('Document uploaded (Demo mode)');
    return { data: { data: { url: 'https://via.placeholder.com/400', publicId: 'demo' } } };
  },
  
  multiple: async (formData) => {
    await delay();
    toast.success('Files uploaded (Demo mode)');
    return { data: { data: [] } };
  },
  
  delete: async (publicId) => {
    await delay();
    toast.success('File deleted');
    return { data: { message: 'Success' } };
  },
  
  getInfo: async (publicId) => {
    await delay();
    return { data: { data: { url: 'https://via.placeholder.com/400' } } };
  }
};

// System Management API
export const mockSystemAPI = {
  testEmail: async (data) => {
    await delay();
    toast.success('Test email sent (Demo mode)');
    return { 
      data: { 
        success: true,
        message: 'Test email sent successfully',
        data: {
          recipient: data.email,
          smtpServer: 'demo-smtp.offbeattrips.com',
          timestamp: new Date().toISOString()
        }
      } 
    };
  },
  
  getStatus: async () => {
    await delay();
    return { 
      data: { 
        data: { 
          status: 'healthy',
          version: '1.0.0-demo',
          environment: 'demo',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy',
            email: 'configured',
            storage: 'healthy',
            oauth: 'not_configured'
          }
        } 
      } 
    };
  },
  
  getAssociatesEmailCount: async () => {
    await delay();
    const associates = getData('mockAssociates');
    return { data: { data: { count: associates.length } } };
  },
  
  emailAllAssociates: async (data) => {
    await delay();
    toast.success('Emails sent to all associates (Demo mode)');
    return { data: { message: 'Success' } };
  }
};

// Health check API
export const mockHealthAPI = {
  check: async () => {
    await delay();
    return { data: { status: 'healthy' } };
  }
};
