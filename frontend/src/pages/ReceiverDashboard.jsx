import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, Clock, Heart, ArrowRight, UtensilsCrossed, ClipboardList, Star, Package } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MealCard from '../components/MealCard';
import StatusBadge from '../components/StatusBadge';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ReceiverDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: nearbyMeals, isLoading: mealsLoading } = useQuery({
    queryKey: ['nearby-meals'],
    queryFn: async () => {
      const { data } = await axios.get('/meals', { params: { limit: 6, sort: 'newest' } });
      return data?.data?.meals || data?.meals || (Array.isArray(data) ? data : []);
    },
  });

  const { data: myRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const { data } = await axios.get('/requests/my');
      return data?.data?.requests || data?.requests || (Array.isArray(data) ? data : []);
    },
  });

  const { data: favorites } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: async () => {
      const { data } = await axios.get('/favorites');
      return data?.data?.favorites || (Array.isArray(data) ? data : data?.data || []);
    },
  });

  const activeRequests = (myRequests || []).filter(r => ['pending', 'approved', 'pickup_scheduled', 'ready_for_pickup'].includes(r.status));
  const completedRequests = (myRequests || []).filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-500 dark:text-gray-400">Find food available near you</p>
          </div>
          <div className="flex gap-3">
            <Link to="/explore" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center gap-2 transition">
              <Search className="w-4 h-4" /> Browse Food
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Requests', value: activeRequests.length, icon: ClipboardList, color: 'from-orange-500 to-orange-600' },
            { label: 'Completed', value: completedRequests.length, icon: Package, color: 'from-green-500 to-green-600' },
            { label: 'Saved Meals', value: (favorites || []).length, icon: Heart, color: 'from-red-500 to-red-600' },
            { label: 'Available Nearby', value: (nearbyMeals || []).length, icon: UtensilsCrossed, color: 'from-purple-500 to-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Active Requests</h2>
              <Link to="/requests" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRequests.slice(0, 3).map((req) => (
                <Link key={req._id} to={`/requests/${req._id}`} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition block">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{req.meal?.title || 'Meal'}</h3>
                    <StatusBadge status={req.status} type="request" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Donor: {req.donor?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Food */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Food</h2>
            <Link to="/explore" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {mealsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : (nearbyMeals || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(nearbyMeals || []).slice(0, 6).map((meal) => (
                <MealCard key={meal._id} meal={meal} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No meals available yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later or expand your search area</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Browse Food', icon: Search, to: '/explore', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
              { label: 'My Requests', icon: ClipboardList, to: '/requests', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
              { label: 'Saved Meals', icon: Heart, to: '/favorites', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
              { label: 'Messages', icon: Star, to: '/chat', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
            ].map((action) => (
              <Link key={action.label} to={action.to} className={`${action.color} rounded-2xl p-5 flex flex-col items-center gap-2 hover:opacity-90 transition`}>
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
