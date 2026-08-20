import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, UtensilsCrossed, ClipboardList, Package, TrendingUp, Shield, Star, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from '../../api/axios';
import StatCard from '../../components/StatCard';

const COLORS = ['#22c55e', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/stats');
      return data || {};
    },
  });

  const { data: mealsOverTime } = useQuery({
    queryKey: ['admin-meals-time'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/analytics/meals');
      return data || [];
    },
  });

  const { data: categoryStats } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/analytics/categories');
      return data || [];
    },
  });

  const { data: topDonors } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: async () => {
      const { data } = await axios.get('/admin/leaderboard');
      return data || [];
    },
  });

  const s = stats || {};

  const formattedMealsOverTime = (mealsOverTime || []).map(m => ({
    name: m._id || m.name,
    meals: m.count || m.meals || 0,
  }));

  const formattedCategoryStats = (categoryStats || []).map(c => ({
    name: c._id || c.name,
    value: c.count || c.value || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Platform overview and management</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={s.totalUsers || 0} color="blue" />
          <StatCard icon={UtensilsCrossed} label="Total Meals" value={s.totalMeals || 0} color="green" />
          <StatCard icon={ClipboardList} label="Completed Requests" value={s.completedRequests || 0} color="orange" />
          <StatCard icon={AlertTriangle} label="Pending Requests" value={s.pendingRequests || 0} color="red" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Active Meals" value={s.activeMeals || 0} color="green" />
          <StatCard icon={TrendingUp} label="People Helped" value={s.peopleHelped || 0} color="purple" />
          <StatCard icon={Star} label="Avg Rating" value={s.avgRating ? Number(s.avgRating).toFixed(1) : '0.0'} color="orange" />
          <StatCard icon={Shield} label="Verified Donors" value={s.verifiedDonors || 0} color="blue" />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meals Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedMealsOverTime.length ? formattedMealsOverTime : generateSampleData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="meals" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Food Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={formattedCategoryStats.length ? formattedCategoryStats : sampleCategories} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(formattedCategoryStats.length ? formattedCategoryStats : sampleCategories).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Donors */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Donors</h3>
          {(topDonors || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No donor data yet</p>
          ) : (
            <div className="space-y-3">
              {(topDonors || []).slice(0, 5).map((donor, i) => (
                <div key={donor._id || i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{donor.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{donor.mealsDonated || 0} meals</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function generateSampleData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(d => ({ name: d, meals: Math.floor(Math.random() * 20) + 5 }));
}

const sampleCategories = [
  { name: 'Meals', value: 45 },
  { name: 'Rice', value: 20 },
  { name: 'Snacks', value: 15 },
  { name: 'Fruits', value: 12 },
  { name: 'Other', value: 8 },
];
