import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Eye, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

export default function AdminMeals() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: meals, isLoading } = useQuery({
    queryKey: ['admin-meals', search, statusFilter],
    queryFn: async () => {
      const { data } = await axios.get('/meals', { params: { search, status: statusFilter, limit: 50 } });
      return data?.data?.meals || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await axios.delete(`/meals/${id}`); },
    onSuccess: () => { toast.success('Meal removed'); queryClient.invalidateQueries({ queryKey: ['admin-meals'] }); },
    onError: () => toast.error('Failed to remove meal'),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Meals</h1>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meals..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-20 animate-pulse" />)}
            </div>
          ) : (meals || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No meals found</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Meal</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Donor</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Servings</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Expiry</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(meals || []).map((meal) => (
                      <tr key={meal._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {meal.images?.[0]?.url ? (
                              <img src={meal.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">🍽️</div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">{meal.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{meal.donor?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{meal.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{meal.servings}</td>
                        <td className="px-6 py-4"><StatusBadge status={meal.status} type="meal" /></td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(meal.availableUntil).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => deleteMutation.mutate(meal._id)} disabled={deleteMutation.isPending}
                              className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
