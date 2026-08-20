import axios from './axios'

export const createFeedback = (data) => axios.post('/feedback', data)

export const getFeedbackForUser = (userId) =>
  axios.get(`/feedback/user/${userId}`)

export const getMyFeedback = () => axios.get('/feedback/my')
