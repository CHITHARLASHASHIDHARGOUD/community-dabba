import axios from './axios'

export const getMeals = (params) => axios.get('/meals', { params })

export const getMealById = (id) => axios.get(`/meals/${id}`)

export const createMeal = (data) => axios.post('/meals', data)

export const updateMeal = (id, data) => axios.put(`/meals/${id}`, data)

export const deleteMeal = (id) => axios.delete(`/meals/${id}`)

export const getMyMeals = () => axios.get('/meals/my')
