import axios from './axios'

export const register = (data) => axios.post('/auth/register', data)

export const login = (data) => axios.post('/auth/login', data)

export const getMe = () => axios.get('/auth/me')

export const updateProfile = (data) => axios.put('/auth/me', data)

export const changePassword = (data) => axios.put('/auth/me/password', data)
