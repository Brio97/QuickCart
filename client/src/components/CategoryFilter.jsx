import { useState, useEffect } from 'react'
import { fetchCategories } from '../services/api'

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCategories()
        // Ensure data is always an array
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
        setCategories([]) // Reset to empty array on error
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6">
        <p className="text-sm text-red-600">Failed to load categories</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange && onCategoryChange('')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Array.isArray(categories) && categories.map((category) => (
          <button
            key={category.id || category.name || Math.random()}
            onClick={() => onCategoryChange && onCategoryChange(category.name)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
              selectedCategory === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter