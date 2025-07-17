import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchProducts = async (searchParams = params) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productsAPI.getAll(searchParams)
      setProducts(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (query) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productsAPI.search(query)
      setProducts(response.data)
    } catch (err) {
      setError(err.message || 'Failed to search products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterByCategory = async (category) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await productsAPI.getByCategory(category)
      setProducts(response.data)
    } catch (err) {
      setError(err.message || 'Failed to filter products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    searchProducts,
    filterByCategory,
    setParams
  }
}

export default useProducts
