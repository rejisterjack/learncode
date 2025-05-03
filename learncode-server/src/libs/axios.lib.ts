import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create axios instance with default configuration
const judgeApi: AxiosInstance = axios.create({
  baseURL: process.env.JUDGE0_API_URL || 'http://localhost:2358',
  headers: {
    'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
    'Content-Type': 'application/json',
  },
})

// Utility functions for API requests
export const apiGet = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await judgeApi.get(url, config)
    return response.data
  } catch (error) {
    throw error
  }
}

export const apiPost = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await judgeApi.post(url, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

export const apiPut = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await judgeApi.put(url, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

export const apiDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await judgeApi.delete(url, config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Export the axios instance
export default judgeApi
