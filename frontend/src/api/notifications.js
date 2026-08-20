import axios from './axios'

export const getNotifications = (page = 1) =>
  axios.get('/notifications', { params: { page } })

export const getUnreadCount = () => axios.get('/notifications/unread-count')

export const markAsRead = (id) => axios.patch(`/notifications/${id}/read`)

export const markAllAsRead = () => axios.patch('/notifications/read-all')
