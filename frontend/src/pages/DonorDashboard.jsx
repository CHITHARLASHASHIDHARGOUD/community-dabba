import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  UtensilsCrossed,
  ClipboardList,
  MessageCircle,
  BarChart3,
  Plus,
  TrendingUp,
  Users,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Utensils,
  Timer,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { useAuth } from '../context/AuthContext';
import { getMyMeals, deleteMeal } from '../api/meals';
import { getReceivedRequests, updateRequestStatus } from '../api/requests';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatRelativeTime, formatDate, getCategoryEmoji } from '../utils/helpers';

const COLORS = ['#22c55e', '#f97316', '#ef4444', '#6366f1', '#a855f7', '#06b6d4'];

function generateSampleBarData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    meals: Math.floor(Math.random() * 8) + 1,
    servings: Math.floor(Math.random() * 30) + 5,
  }));
}

function generateSamplePieData() {
  return [
    { name: 'Pending', value: 4, color: '#f97316' },
    { name: 'Approved', value: 8, color: '#22c55e' },
    { name: 'Rejected', value: 2, color: '#ef4444' },
    { name: 'Completed', value: 12, color: '#6366f1' },
  ];
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">Count: {payload[0].value}</p>
    </div>
  );
};

export default function DonorDashboard() {
  const { user } = useAuth();
  const chartsRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['myMeals'],
    queryFn: async () => {
      const { data } = await getMyMeals();
      return data;
    },
    retry: 1,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['receivedRequests'],
    queryFn: async () => {
      const { data } = await getReceivedRequests();
      return data;
    },
    retry: 1,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await updateRequestStatus(id, status);
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myMeals'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
    onError: () => toast.error('Failed to update request'),
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (id) => {
      await deleteMeal(id);
    },
    onSuccess: () => {
      toast.success('Meal deleted');
      queryClient.invalidateQueries({ queryKey: ['myMeals'] });
    },
    onError: () => toast.error('Failed to delete meal'),
  });

  const stats = (() => {
    const d = statsData?.data || statsData;
    const mealsArr = Array.isArray(d?.meals) ? d.meals : Array.isArray(d) ? d : [];
    const reqs = requestsData?.data || requestsData;
    const reqsArr = Array.isArray(reqs?.requests) ? reqs.requests : Array.isArray(reqs) ? reqs : [];
    return {
      mealsDonated: mealsArr.filter(m => m.status === 'completed').length,
      activeMeals: mealsArr.filter(m => m.status === 'active' || m.status === 'expiring_soon').length,
      pendingRequests: reqsArr.filter(r => r.status === 'pending').length,
      peopleHelped: reqsArr.filter(r => r.status === 'completed').length,
    };
  })();

  const mealsRaw = statsData?.data || statsData;
  const recentMeals = (Array.isArray(mealsRaw?.meals) ? mealsRaw.meals : Array.isArray(mealsRaw) ? mealsRaw : []).slice(0, 5);
  const reqsRaw = requestsData?.data || requestsData;
  const recentRequests = (Array.isArray(reqsRaw?.requests) ? reqsRaw.requests : Array.isArray(reqsRaw) ? reqsRaw : []).slice(0, 5);

  const allMeals = Array.isArray(mealsRaw?.meals) ? mealsRaw.meals : Array.isArray(mealsRaw) ? mealsRaw : [];
  const allRequests = Array.isArray(reqsRaw?.requests) ? reqsRaw.requests : Array.isArray(reqsRaw) ? reqsRaw : [];

  const chartBarData = (() => {
    if (allMeals.length === 0) return generateSampleBarData();
    const dayCounts = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    allMeals.forEach((m) => {
      const d = new Date(m.createdAt);
      const day = days[d.getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    return days.map((day) => ({ day, meals: dayCounts[day] || 0 }));
  })();

  const chartPieData = (() => {
    if (allRequests.length === 0) return generateSamplePieData();
    const statusCounts = {};
    allRequests.forEach((r) => {
      const s = r.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
      value,
      color: COLORS[i % COLORS.length],
    }));
  })();

  const scrollToCharts = () => {
    chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const statCards = [
    { icon: UtensilsCrossed, label: 'Total Donations', value: stats.mealsDonated || stats.totalMeals || 0, color: 'green', trend: 'up', trendValue: '+12%' },
    { icon: Timer, label: 'Active Meals', value: stats.activeMeals || stats.active || 0, color: 'blue', trend: 'up', trendValue: '+3' },
    { icon: ClipboardList, label: 'Pending Requests', value: stats.pendingRequests || stats.pending || 0, color: 'orange', trend: 'neutral', trendValue: '0' },
    { icon: Users, label: 'People Helped', value: stats.peopleHelped || stats.totalPeople || 0, color: 'purple', trend: 'up', trendValue: '+8' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=22c55e&color=fff&size=128`}
                  alt={user?.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-green-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name?.split(' ')[0] || 'Donor'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <Utensils className="w-3 h-3 mr-1" />
                    Donor
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to="/donor/meals/new"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Meal</span>
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statsLoading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
        </div>

        {/* Quick Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Add Food', icon: Plus, to: '/donor/meals/new', gradient: 'from-green-500 to-emerald-600', hover: 'hover:from-green-600 hover:to-emerald-700' },
              { label: 'View Requests', icon: ClipboardList, to: '/requests', gradient: 'from-orange-400 to-orange-600', hover: 'hover:from-orange-500 hover:to-orange-700' },
              { label: 'Messages', icon: MessageCircle, to: '/chat', gradient: 'from-blue-500 to-indigo-600', hover: 'hover:from-blue-600 hover:to-indigo-700' },
              { label: 'Analytics', icon: BarChart3, onClick: scrollToCharts, gradient: 'from-purple-500 to-violet-600', hover: 'hover:from-purple-600 hover:to-violet-700' },
            ].map((action) => {
              const Icon = action.icon;
              const Component = action.to ? Link : 'button';
              const props = action.to ? { to: action.to } : { onClick: action.onClick };
              return (
                <motion.div key={action.label} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Component
                    {...props}
                    className={`w-full flex flex-col items-center justify-center space-y-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${action.gradient} ${action.hover} text-white transition-all shadow-md hover:shadow-lg cursor-pointer`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span className="text-xs sm:text-sm font-medium">{action.label}</span>
                  </Component>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Charts Section */}
        <div ref={chartsRef} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Donations Over Time */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Donations Over Time</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
                </div>
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">+18%</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="meals" name="Meals" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Request Status Pie */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 sm:p-6"
            >
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Request Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time breakdown</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Meals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Meals</h2>
            <Link
              to="/donor/meals/new"
              className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 inline-flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            {statsLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : recentMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No meals yet. Add your first meal!</p>
                <Link
                  to="/donor/meals/new"
                  className="mt-3 inline-flex items-center space-x-1 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Meal</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Meal</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Category</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Servings</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Expiry</th>
                      <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                    {recentMeals.map((meal) => (
                      <tr key={meal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={meal.images?.[0]?.url || meal.image || meal.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(meal.title || 'M')}&background=f97316&color=fff&size=80`}
                              alt={meal.title}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                                {getCategoryEmoji(meal.category)} {meal.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                {meal.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {getCategoryEmoji(meal.category)} {meal.category?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{meal.servings || 1}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={meal.status || 'available'} />
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {meal.expiryTime ? formatDate(meal.expiryTime) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <Link
                              to={`/donor/meals/${meal._id}/edit`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this meal?')) {
                                  deleteMealMutation.mutate(meal._id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Requests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h2>
            <Link
              to="/requests"
              className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
            {requestsLoading ? (
              <div className="p-4">
                <SkeletonTable rows={5} />
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No incoming requests yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
                {recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={request.requester?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester?.name || 'U')}&background=6366f1&color=fff`}
                        alt={request.requester?.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {request.requester?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {request.meal?.title || 'a meal'} &middot; {formatRelativeTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-12 sm:ml-0 flex-shrink-0">
                      <StatusBadge status={request.status || 'pending'} />
                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateRequestMutation.mutate({ id: request._id, status: 'approved' })}
                            disabled={updateRequestMutation.isPending}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateRequestMutation.mutate({ id: request._id, status: 'rejected' })}
                            disabled={updateRequestMutation.isPending}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
