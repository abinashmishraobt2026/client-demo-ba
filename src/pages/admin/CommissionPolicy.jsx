import React, { useState, useEffect } from 'react';
import { commissionPoliciesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const PACKAGE_TYPES = ['Domestic', 'International', 'Resort'];

const AdminCommissionPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ packageType: '', commissionPercent: '' });
  const [editingId, setEditingId] = useState(null);
  const [editPercent, setEditPercent] = useState('');

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await commissionPoliciesAPI.getAll();
      setPolicies(response.data?.data || []);
    } catch {
      toast.error('Failed to load commission policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const percent = parseFloat(form.commissionPercent);
    if (!form.packageType.trim()) {
      toast.error('Select package type');
      return;
    }
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error('Commission percent must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await commissionPoliciesAPI.create({
        packageType: form.packageType.trim(),
        commissionPercent: percent,
        isActive: true
      });
      toast.success('Commission policy saved');
      setForm({ packageType: '', commissionPercent: '' });
      fetchPolicies();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save policy';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (id) => {
    const percent = parseFloat(editPercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error('Commission percent must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await commissionPoliciesAPI.update(id, { commissionPercent: percent });
      toast.success('Policy updated');
      setEditingId(null);
      setEditPercent('');
      fetchPolicies();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update policy';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (policy) => {
    setEditingId(policy.id);
    setEditPercent(String(policy.commissionPercent));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPercent('');
  };

  const existingTypes = policies.map((p) => p.packageType);
  const availableTypes = PACKAGE_TYPES.filter((t) => !existingTypes.includes(t));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commission Policy</h1>
        <p className="text-gray-600">Set commission rate per package type. Associates see these rates on their Commission Policy page.</p>
      </div>

      {/* Add new policy (only if a type is not yet added) */}
      {availableTypes.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add policy</h2>
          <form onSubmit={handleAddSubmit} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[140px]">
              <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-1">
                Package type
              </label>
              <select
                id="packageType"
                name="packageType"
                value={form.packageType}
                onChange={(e) => setForm((f) => ({ ...f, packageType: e.target.value }))}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[120px]">
              <label htmlFor="commissionPercent" className="block text-sm font-medium text-gray-700 mb-1">
                Commission %
              </label>
              <input
                id="commissionPercent"
                name="commissionPercent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.commissionPercent}
                onChange={(e) => setForm((f) => ({ ...f, commissionPercent: e.target.value }))}
                placeholder="e.g. 5"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !form.packageType || !form.commissionPercent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Save policy
            </button>
          </form>
        </div>
      )}

      {/* List of policies */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current policies</h2>
          <p className="mt-1 text-sm text-gray-500">These rates are used for lead confirmation and package commission.</p>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : policies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No policies yet. Add one using the form above (Domestic, International, Resort).
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <li key={policy.id} className="px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">{policy.packageType}</span>
                  {editingId === policy.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        id={`commission-percent-edit-${policy.id}`}
                        name="commissionPercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={editPercent}
                        onChange={(e) => setEditPercent(e.target.value)}
                        className="block w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">{Number(policy.commissionPercent)}%</span>
                  )}
                  {policy.isActive === false && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === policy.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditSave(policy.id)}
                        disabled={saving}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(policy)}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCommissionPolicy;
