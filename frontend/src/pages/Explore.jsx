import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  UtensilsCrossed,
  Loader2,
} from 'lucide-react';
import { getMeals } from '../api/meals';
import MealCard from '../components/MealCard';

const CATEGORIES = [
  { value: 'all', label: 'All', emoji: '🍽️' },
  { value: 'meals', label: 'Meals', emoji: '🍛' },
  { value: 'rice', label: 'Rice', emoji: '🍚' },
  { value: 'biryani', label: 'Biryani', emoji: '🥘' },
  { value: 'bakery', label: 'Bakery', emoji: '🍞' },
  { value: 'fruits', label: 'Fruits', emoji: '🍎' },
  { value: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { value: 'snacks', label: 'Snacks', emoji: '🍿' },
  { value: 'dairy', label: 'Dairy', emoji: '🥛' },
  { value: 'packed_food', label: 'Packed Food', emoji: '📦' },
  { value: 'other', label: 'Other', emoji: '🍽️' },
];

const FOOD_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'vegetarian', label: 'Veg' },
  { value: 'non-vegetarian', label: 'Non-Veg' },
  { value: 'vegan', label: 'Vegan' },
];

const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search meals, cuisines, donors..."
        className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-all text-sm"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

function CategoryPills({ selected, onSelect }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.value)}
            className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              selected === cat.value
                ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none md:hidden" />
    </div>
  );
}

function FilterSection({ filters, onChange, mobileOpen, onToggleMobile }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onToggleMobile}
        className="md:hidden flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(filters.foodType !== 'all' || filters.sort !== 'nearest' || filters.minServings > 1) && (
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        {mobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <div
        className={`${mobileOpen ? '' : 'hidden'} md:block`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Food Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOOD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => onChange({ ...filters, foodType: type.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.foodType === type.value
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => onChange({ ...filters, sort: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Min Servings
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={filters.minServings}
                    onChange={(e) => onChange({ ...filters, minServings: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-green-500"
                  />
                  <span className="w-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filters.minServings}
                  </span>
                </div>
              </div>
            </div>
        </div>
      </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-12" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-32 h-32 mb-8 rounded-3xl bg-gradient-to-br from-green-100 to-orange-100 dark:from-green-900/30 dark:to-orange-900/30 flex items-center justify-center">
        <UtensilsCrossed className="w-16 h-16 text-green-400 dark:text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No meals found</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-2">
        We couldn&apos;t find any meals matching your search. Try different keywords or adjust your filters.
      </p>
      <div className="flex items-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
        <span>Pro tip:</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">Remove all filters</span>
        <span>to see everything available</span>
      </div>
    </motion.div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            1
          </button>
          {start > 2 && <span className="text-gray-400 dark:text-gray-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 text-sm font-medium rounded-xl transition-all ${
            page === currentPage
              ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
              : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 dark:text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const foodType = searchParams.get('foodType') || 'all';
  const sort = searchParams.get('sort') || 'nearest';
  const minServings = Number(searchParams.get('minServings')) || 1;
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === '' || value === 'all' || value === 1 || value === 'nearest') {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    updateParams({ search: debouncedSearch || null, page: 1 });
  }, [debouncedSearch, updateParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['meals', { search: debouncedSearch, category, foodType, sort, minServings, page }],
    queryFn: async () => {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category && category !== 'all') params.category = category;
      if (foodType && foodType !== 'all') params.foodType = foodType;
      if (sort) params.sort = sort;
      if (minServings > 1) params.minServings = minServings;
      const { data } = await getMeals(params);
      return data;
    },
    keepPreviousData: true,
  });

  const meals = data?.data?.meals || data?.meals || (Array.isArray(data) ? data : []);
  const totalPages = data?.data?.pagination?.pages || data?.totalPages || data?.pages || 1;
  const totalMeals = data?.data?.pagination?.total || data?.total || data?.count || meals.length;

  const handleCategoryChange = (value) => {
    updateParams({ category: value, page: 1 });
  };

  const handleFiltersChange = (newFilters) => {
    updateParams({
      foodType: newFilters.foodType,
      sort: newFilters.sort,
      minServings: newFilters.minServings > 1 ? newFilters.minServings : null,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Explore Meals</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover fresh, homemade food shared by your community
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <CategoryPills selected={category} onSelect={handleCategoryChange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <FilterSection
            filters={{ foodType, sort, minServings }}
            onChange={handleFiltersChange}
            mobileOpen={mobileFiltersOpen}
            onToggleMobile={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          />
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? (
              'Loading meals...'
            ) : (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">{totalMeals}</span>{' '}
                {totalMeals === 1 ? 'meal' : 'meals'} found
              </>
            )}
          </p>
          {isFetching && !isLoading && (
            <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal, i) => (
                <MealCard key={meal._id} meal={meal} index={i} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
