export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    picked_up: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    picked_up: 'Picked Up',
    completed: 'Completed',
    cancelled: 'Cancelled',
    available: 'Available',
    reserved: 'Reserved',
    expired: 'Expired',
    draft: 'Draft',
  }
  return labels[status] || status
}

export function getCategoryEmoji(category) {
  const emojis = {
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
  }
  return emojis[category] || '🍽️'
}

export function truncateText(text, length = 100) {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function calculateExpiry(availableUntil) {
  const now = new Date()
  const expiry = new Date(availableUntil)
  const diffMs = expiry - now

  if (diffMs <= 0) return 'Expired'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m left`
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m left`
  return `${diffDays}d ${diffHours % 24}h left`
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password) {
  const errors = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('One number')
  return {
    isValid: errors.length === 0,
    errors,
  }
}
