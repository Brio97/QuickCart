import axios from 'axios'

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Resource not found')
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.')
    }
    
    throw error
  }
)

// Products API
export const fetchProducts = async (params = {}) => {
  try {
    const {
      page = 1,
      per_page = 20,
      category,
      search,
    } = params

    const queryParams = {
      page,
      per_page,
      ...(category && { category }),
      ...(search && { search }),
    }

    const response = await apiClient.get('/products', { params: queryParams })
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }
}

export const fetchProduct = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`)
  }
}

export const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/categories')
    // Transform backend response to match frontend expectations
    const categories = response.data.categories || response.data
    return Array.isArray(categories) 
      ? categories.map(cat => typeof cat === 'string' ? { name: cat, id: cat } : cat)
      : []
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }
}

// Cart API
export const validateCart = async (cartItems) => {
  try {
    const items = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))

    const response = await apiClient.post('/cart/validate', { items })
    return response.data
  } catch (error) {
    throw new Error(`Failed to validate cart: ${error.message}`)
  }
}

// Order API - Updated to match backend endpoint
export const submitOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/checkout', orderData)
    return response.data
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error(`Failed to submit order: ${error.message}`)
  }
}

export const fetchOrder = async (orderNumber) => {
  try {
    const response = await apiClient.get(`/orders/${orderNumber}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch order: ${error.message}`)
  }
}

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`)
  }
}

export default apiClient