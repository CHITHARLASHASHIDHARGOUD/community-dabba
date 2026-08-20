import axios from './axios'

export const getDashboardStats = () => axios.get('/admin/stats')

export const getUsersOverTime = () => axios.get('/admin/analytics/users')

export const getMealsOverTime = () => axios.get('/admin/analytics/meals')

export const getRequestStats = () => axios.get('/admin/analytics/requests')

export const getCategoryStats = () => axios.get('/admin/analytics/categories')

export const getTopDonors = () => axios.get('/admin/leaderboard')

export const getUsers = (params) => axios.get('/users', { params })

export const blockUser = (id) => axios.patch(`/users/${id}/status`)

export const verifyUser = (id) => axios.patch(`/users/${id}/verify`)

export const getAllReports = (params) =>
  axios.get('/reports/admin', { params })

export const updateReportStatus = (id, data) =>
  axios.patch(`/reports/admin/${id}`, data)
