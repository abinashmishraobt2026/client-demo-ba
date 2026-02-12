// STATIC DEMO VERSION - All API calls are mocked for GitHub Pages deployment
// No backend required - all data stored in localStorage

import { 
  mockAuthAPI, 
  mockPasswordAPI, 
  mockPublicAPI 
} from './mockAuth';

import {
  mockAssociatesAPI,
  mockLeadsAPI,
  mockPackagesAPI,
  mockCommissionAPI,
  mockDashboardAPI,
  mockNotificationsAPI,
  mockPackageImagesAPI,
  mockCommissionPoliciesAPI,
  mockUploadAPI,
  mockSystemAPI,
  mockHealthAPI
} from './mockData';

// Export all mock APIs
export const authAPI = mockAuthAPI;
export const passwordAPI = mockPasswordAPI;
export const associatesAPI = mockAssociatesAPI;
export const leadsAPI = mockLeadsAPI;
export const packagesAPI = mockPackagesAPI;
export const commissionAPI = mockCommissionAPI;
export const dashboardAPI = mockDashboardAPI;
export const healthAPI = mockHealthAPI;
export const notificationsAPI = mockNotificationsAPI;
export const packageImagesAPI = mockPackageImagesAPI;
export const commissionPoliciesAPI = mockCommissionPoliciesAPI;
export const uploadAPI = mockUploadAPI;
export const publicAPI = mockPublicAPI;
export const systemAPI = mockSystemAPI;

// Default export (not used in static version)
export default {
  authAPI,
  passwordAPI,
  associatesAPI,
  leadsAPI,
  packagesAPI,
  commissionAPI,
  dashboardAPI,
  healthAPI,
  notificationsAPI,
  packageImagesAPI,
  commissionPoliciesAPI,
  uploadAPI,
  publicAPI,
  systemAPI
};