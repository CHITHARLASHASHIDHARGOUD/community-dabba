import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Shield, Star, UtensilsCrossed, Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RatingDisplay } from '../components/RatingStars';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axios.get('/auth/me');
      return data?.data?.user || data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const { data } = await axios.put('/auth/me', updates);
      return data;
    },
    onSuccess: (data) => {
      const updated = data?.data?.user || data;
      updateUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const startEdit = () => {
    setForm({ name: profile?.name || '', phone: profile?.phone || '', location: profile?.location?.address || '' });
    setEditing(true);
  };

  const p = profile || user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="h-32 bg-gradient-to-r from-green-500 to-orange-500" />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center text-3xl font-bold text-green-600 shadow-lg">
                  {p?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{p?.name}</h1>
                    {p?.isVerified && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 capitalize">{p?.role}</p>
                </div>
                {!editing && (
                  <button onClick={startEdit} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                  <button onClick={() => updateMutation.mutate({ name: form.name, phone: form.phone, location: { address: form.location } })} disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-2 transition">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Rating', value: p?.rating ? `${p.rating.toFixed(1)} ★` : 'N/A', icon: Star },
              { label: p?.role === 'donor' ? 'Donated' : 'Received', value: p?.role === 'donor' ? (p?.mealsDonated || 0) : (p?.mealsReceived || 0), icon: UtensilsCrossed },
              { label: 'Member Since', value: new Date(p?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar },
              { label: 'Badges', value: (p?.badges || []).length, icon: Award },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm text-center">
                <s.icon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Info</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <div><p className="text-xs text-gray-400">Email</p><p className="text-sm text-gray-900 dark:text-white">{p?.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div><p className="text-xs text-gray-400">Phone</p><p className="text-sm text-gray-900 dark:text-white">{p?.phone || 'Not set'}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div><p className="text-xs text-gray-400">Location</p><p className="text-sm text-gray-900 dark:text-white">{p?.location?.address || 'Not set'}</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
