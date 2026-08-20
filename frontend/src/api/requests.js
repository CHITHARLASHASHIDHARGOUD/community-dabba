import axios from './axios'

export const createRequest = (data) => axios.post('/requests', data)

export const getMyRequests = () => axios.get('/requests/my')

export const getReceivedRequests = () => axios.get('/requests/received')

export const updateRequestStatus = (id, status) =>
  axios.patch(`/requests/${id}/status`, { status })

export const cancelRequest = (id) => axios.patch(`/requests/${id}/cancel`)

export const verifyPickup = (id, pickupCode) =>
  axios.post(`/requests/${id}/verify-pickup`, { pickupCode })

export const completeRequest = (id) => axios.post(`/requests/${id}/complete`)
