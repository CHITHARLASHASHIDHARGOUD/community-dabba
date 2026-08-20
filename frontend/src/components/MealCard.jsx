import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Clock,
  Users,
  MapPin,
  Leaf,
  Drumstick,
  Star,
} from 'lucide-react';

const categoryEmojis = {
  meals: '🍛',
  rice: '🍚',
  biryani: '🥘',
  bakery: '🍞',
  fruits: '🍎',
  vegetables: '🥬',
  snacks: '🍿',
  dairy: '🥛',
  packed_food: '📦',
  other: '🍽️',
  default: '🍽️',
};

function getExpiryStatus(expiryTime) {
  if (!expiryTime) return null;
  const now = new Date();
  const expiry = new Date(expiryTime);
  const hoursLeft = (expiry - now) / (1000 * 60 * 60);

  if (hoursLeft < 0) return { label: 'Expired', color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' };
  if (hoursLeft < 6) return { label: `${Math.round(hoursLeft)}h left`, color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' };
  if (hoursLeft < 24) return { label: `${Math.round(hoursLeft)}h left`, color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' };
  return { label: `${Math.round(hoursLeft / 24)}d left`, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' };
}

export default function MealCard({ meal, index = 0 }) {
  const [saved, setSaved] = useState(meal.isSaved || false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const expiryStatus = getExpiryStatus(meal.expiryTime);
  const emoji = categoryEmojis[meal.category] || categoryEmojis.default;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/meals/${meal._id}`} className="block group">
        <motion.div
          whileHover={{ y: -6 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}
            <img
              src={meal.images?.[0]?.url || meal.image || meal.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(meal.title || 'Meal')}&background=f97316&color=fff&size=400`}
              alt={meal.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />

            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                {emoji} {meal.category}
              </span>
              {meal.isVegetarian !== undefined && (
                <span className={`p-1.5 rounded-lg shadow-sm backdrop-blur-sm ${
                  meal.isVegetarian
                    ? 'bg-green-500/90 text-white'
                    : 'bg-orange-500/90 text-white'
                }`}>
                  {meal.isVegetarian ? (
                    <Leaf className="w-3.5 h-3.5" />
                  ) : (
                    <Drumstick className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleSave}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
              aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  saved ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'
                }`}
              />
            </motion.button>

            {expiryStatus && (
              <div className={`absolute bottom-3 left-3 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm ${
                expiryStatus.label === 'Expired' || expiryStatus.label.includes('h left')
                  ? 'bg-red-500/90 text-white'
                  : expiryStatus.label.includes('d left')
                    ? 'bg-green-500/90 text-white'
                    : 'bg-yellow-500/90 text-white'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{expiryStatus.label}</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
              {meal.title}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {meal.description || `Homemade ${meal.category} meal`}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-1.5 text-sm text-gray-600 dark:text-gray-400">
                <img
                  src={meal.donor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(meal.donor?.name || 'D')}&background=22c55e&color=fff`}
                  alt={meal.donor?.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="truncate max-w-[100px]">{meal.donor?.name || 'Anonymous'}</span>
              </div>

              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{meal.servings || 1}</span>
                </div>
                {meal.distance && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{meal.distance}</span>
                  </div>
                )}
              </div>
            </div>

            {meal.rating && (
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(meal.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({meal.ratingCount || 0})
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
