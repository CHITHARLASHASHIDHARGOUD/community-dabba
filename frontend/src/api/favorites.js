import axios from './axios'

export const toggleFavorite = (mealId) =>
  axios.post(`/favorites/${mealId}`)

export const getMyFavorites = () => axios.get('/favorites')

export const checkFavorite = (mealId) =>
  axios.get(`/favorites/check/${mealId}`)
