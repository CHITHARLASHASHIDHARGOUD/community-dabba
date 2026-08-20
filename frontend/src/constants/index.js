export const CATEGORIES = [
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
]

export const FOOD_TYPES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

export const REQUEST_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  approved: { label: 'Approved', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  rejected: { label: 'Rejected', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  pickup_scheduled: { label: 'Pickup Scheduled', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
  collected: { label: 'Collected', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' },
  completed: { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
}

export const MEAL_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  expired: { label: 'Expired', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  completed: { label: 'Completed', color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
}

export const REPORT_REASONS = [
  { value: 'fake_meal', label: 'Fake Meal' },
  { value: 'expired_food', label: 'Expired Food' },
  { value: 'wrong_location', label: 'Wrong Location' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'suspicious', label: 'Suspicious User' },
  { value: 'abuse', label: 'Abuse' },
  { value: 'other', label: 'Other' },
]
