import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, HeartOff, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import MealCard from '../components/MealCard';

export default function Favorites() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await axios.get('/favorites');
      return data || [];
    },
  });

  const toggleFav = useMutation({
    mutationFn: async (mealId) => {
      await axios.post(`/favorites/${mealId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved Meals</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Meals you've saved for later</p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : (favorites || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
              <HeartOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved meals</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Browse meals and save your favorites</p>
              <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                <UtensilsCrossed className="w-4 h-4" /> Browse Food
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(favorites || []).map((fav) => {
                const meal = fav.meal || fav;
                if (!meal || !meal._id) return null;
                return (
                  <div key={fav._id || meal._id} className="relative">
                    <MealCard meal={meal} />
                    <button onClick={() => toggleFav.mutate(meal._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition z-10">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
