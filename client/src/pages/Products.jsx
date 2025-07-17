import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { fetchProducts, fetchCategories } from '../services/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()

  const currentPage = parseInt(searchParams.get('page')) || 1
  const selectedCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories()
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = {
          page: currentPage,
          per_page: 12,
          ...(selectedCategory && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
        }

        const data = await fetchProducts(params)
        setProducts(data.products || [])
        setPagination({
          total: data.total,
          pages: data.pages,
          current_page: data.current_page
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [currentPage, selectedCategory, searchQuery])

  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams)
    if (query) {
      newParams.set('search', query)
    } else {
      newParams.delete('search')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams)
    if (category) {
      newParams.set('category', category)
    } else {
      newParams.delete('category')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
  }

  const retryLoad = () => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = {
          page: currentPage,
          per_page: 12,
          ...(selectedCategory && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
        }

        const data = await fetchProducts(params)
        setProducts(data.products || [])
        setPagination({
          total: data.total,
          pages: data.pages,
          current_page: data.current_page
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                onSearch={handleSearch} 
                initialValue={searchQuery}
                placeholder="Search products..."
              />
            </div>
            <div className="md:w-64">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* Results Info */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.total > 0 ? (
                  <>
                    Showing {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, pagination.total)} of {pagination.total} products
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory && ` in "${selectedCategory}"`}
                  </>
                ) : (
                  'No products found'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && <LoadingSpinner message="Loading products..." />}
        
        {error && <ErrorMessage message={error} onRetry={retryLoad} />}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchParams({})
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products
