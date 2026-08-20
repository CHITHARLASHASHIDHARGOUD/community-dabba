import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const gradients = {
  green: 'from-green-500 to-emerald-600',
  orange: 'from-orange-400 to-orange-600',
  blue: 'from-blue-500 to-indigo-600',
  purple: 'from-purple-500 to-violet-600',
  red: 'from-red-400 to-rose-600',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-500 dark:text-red-400',
  neutral: 'text-gray-400 dark:text-gray-500',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color = 'green',
  index = 0,
}) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradients[color]}`} />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          {Icon && (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        {(trend || trendValue) && (
          <div className="mt-4 flex items-center space-x-1.5">
            {TrendIcon && (
              <TrendIcon className={`w-4 h-4 ${trendColors[trend]}`} />
            )}
            {trendValue && (
              <span className={`text-sm font-medium ${trendColors[trend]}`}>
                {trendValue}
              </span>
            )}
            <span className="text-sm text-gray-400 dark:text-gray-500">vs last week</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
