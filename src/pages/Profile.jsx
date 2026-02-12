import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, PencilIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { passwordAPI } from '../services/api';
import { isAuthenticated, isAdmin, isAssociate, clearAuth } from '../utils/auth';
import FileUpload, { FilePreview } from '../components/common/FileUpload';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const DEFAULT_AVATAR_BASE = 'https://ui-avatars.com/api/?background=1e3a8a&color=fff&size=200';

const getDefaultAvatarUrl = (name) => {
  const n = name && name.trim() ? name.trim() : 'User';
  return `${DEFAULT_AVATAR_BASE}&name=${encodeURIComponent(n)}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', profilePicture: '' });
  const [uploadedProfileImage, setUploadedProfileImage] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await passwordAPI.getProfile();
      const p = res.data?.data?.profile || res.data?.profile;
      setProfile(p);
      if (p) {
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          address: p.address || '',
          profilePicture: p.profilePicture || ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load profile');
      navigate(isAdmin() ? '/admin/dashboard' : '/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAssociate()) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        profilePicture: (uploadedProfileImage?.url || formData.profilePicture) || null
      };
      const res = await passwordAPI.updateProfile(payload);
      const p = res.data?.data?.profile || res.data?.profile;
      setProfile(p);
      setFormData({
        name: p?.name || '',
        phone: p?.phone || '',
        address: p?.address || '',
        profilePicture: p?.profilePicture || ''
      });
      setUploadedProfileImage(null);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = profile?.profilePicture?.trim()
    ? profile.profilePicture
    : getDefaultAvatarUrl(profile?.name);

  const handleDeactivate = async () => {
    if (deactivating) return;
    setDeactivating(true);
    try {
      await passwordAPI.deactivateAccount();
      clearAuth();
      toast.success('Account deactivated. Contact admin to reactivate.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate account');
    } finally {
      setDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  const isAssoc = isAssociate();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={editing && (uploadedProfileImage?.url || formData.profilePicture) ? (uploadedProfileImage?.url || formData.profilePicture) : avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                onError={(e) => {
                  e.target.src = getDefaultAvatarUrl(profile?.name);
                }}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              {profile.role && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isAssoc && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Unique ID</label>
                  <p className="mt-1 text-gray-900 font-medium">{profile.uniqueId || '–'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{profile.email || '–'}</p>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile picture (optional)</label>
                    {uploadedProfileImage ? (
                      <div className="flex items-center gap-3">
                        <FilePreview file={uploadedProfileImage} onRemove={() => setUploadedProfileImage(null)} className="w-20 h-20 rounded-full object-cover" />
                        <p className="text-sm text-green-600">New photo selected</p>
                      </div>
                    ) : (
                      <FileUpload
                        uploadType="packageImage"
                        accept="image/*"
                        maxSize={2}
                        onUploadSuccess={(data) => {
                          const file = data?.file || data;
                          if (file?.url) {
                            setUploadedProfileImage(file);
                            toast.success('Photo uploaded');
                          }
                        }}
                        onUploadError={() => toast.error('Upload failed')}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Upload to change. We save the image URL only.</p>
                  </div>
                  <div>
                    <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      id="profile-phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      id="profile-address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({ name: profile.name || '', phone: profile.phone || '', address: profile.address || '', profilePicture: profile.profilePicture || '' });
                        setUploadedProfileImage(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{profile.phone || '–'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{profile.address || '–'}</p>
                  </div>
                  {profile.bankDetails && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Bank details (for commission)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Account</span>
                          <p className="text-gray-900">{profile.bankDetails.accountNumber || '–'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">IFSC</span>
                          <p className="text-gray-900">{profile.bankDetails.ifscCode || '–'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">UPI</span>
                          <p className="text-gray-900">{profile.bankDetails.upiId || '–'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                    Update personal details
                  </button>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Account</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Deactivating your account will log you out and you will not be able to sign in again. Contact admin to reactivate.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeactivateConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50"
                    >
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      Deactivate my account
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {isAdmin() && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-gray-900">{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Joined</label>
                <p className="mt-1 text-gray-900">{profile.createdAt ? formatDate(profile.createdAt) : '–'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeactivateConfirm}
        onClose={() => !deactivating && setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        title="Deactivate account?"
        message="You will be logged out and will not be able to sign in again. Your data will remain in the system. Contact admin (ops@offbeattrips.in) to reactivate your account. Continue?"
        confirmText={deactivating ? 'Deactivating...' : 'Yes, deactivate'}
        type="danger"
      />
    </div>
  );
};

export default Profile;
