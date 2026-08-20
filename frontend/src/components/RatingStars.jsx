import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function RatingDisplay({ rating = 0, count = 0, size = 'md' }) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      {count > 0 && (
        <span className={`${textSizes[size]} text-gray-500 dark:text-gray-400 ml-1`}>
          ({count})
        </span>
      )}
    </div>
  );
}

export function RatingInput({ value = 0, onChange, maxRating = 5, size = 'lg' }) {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center space-x-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hovered || value);

        return (
          <motion.button
            key={i}
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange?.(starValue)}
            className="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-0.5"
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizes[size]} transition-colors ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

export default RatingDisplay;
