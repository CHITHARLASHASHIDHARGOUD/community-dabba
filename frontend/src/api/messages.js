import axios from './axios'

export const getConversations = () => axios.get('/messages/conversations')

export const getMessages = (conversationId, page = 1) =>
  axios.get(`/messages/conversations/${conversationId}`, { params: { page } })

export const sendMessage = (data) => axios.post('/messages', data)

export const getOrCreateConversation = (data) =>
  axios.post('/messages/conversations', data)
