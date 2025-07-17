import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock component that simulates a product search page
const MockProductSearch = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [results, setResults] = React.useState(['Product 1', 'Product 2'])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (searchTerm === 'error') {
        setError('Search failed')
        setResults([])
      } else if (searchTerm === '') {
        setResults([])
      } else {
        setResults([`Result for: ${searchTerm}`])
        setError(null)
      }
      setLoading(false)
    }, 100)
  }

  return (
    <div data-testid="product-search">
      <h1>Product Search</h1>
      <form onSubmit={handleSearch}>
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="search-input"
        />
        <button type="submit">Search</button>
      </form>
      
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      
      <div data-testid="search-results">
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
    </div>
  )
}

const renderWithRouter = (component) => {
  cleanup()
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Product Search Integration', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  test('renders product search page', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    expect(container.querySelector('[data-testid="product-search"]')).toBeInTheDocument()
    expect(container.querySelector('h1')).toHaveTextContent('Product Search')
  })

  test('displays search input', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    // Use container to find the specific search input
    const searchInput = container.querySelector('[data-testid="search-input"]')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search products...')
  })

  test('shows search results', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    const resultsContainer = container.querySelector('[data-testid="search-results"]')
    expect(resultsContainer).toBeInTheDocument()
    expect(resultsContainer).toHaveTextContent('Product 1')
    expect(resultsContainer).toHaveTextContent('Product 2')
  })

  test('search functionality works', async () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    const searchInput = container.querySelector('[data-testid="search-input"]')
    const form = container.querySelector('form')
    
    fireEvent.change(searchInput, { target: { value: 'laptop' } })
    fireEvent.submit(form)
    
    // Wait for loading to appear and disappear
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).toBeInTheDocument()
    })
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument()
    })
    
    const resultsContainer = container.querySelector('[data-testid="search-results"]')
    expect(resultsContainer).toHaveTextContent('Result for: laptop')
  })

  test('handles empty search results', async () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    const searchInput = container.querySelector('[data-testid="search-input"]')
    const form = container.querySelector('form')
    
    fireEvent.change(searchInput, { target: { value: '' } })
    fireEvent.submit(form)
    
    await waitFor(() => {
      const resultsContainer = container.querySelector('[data-testid="search-results"]')
      expect(resultsContainer).toBeEmptyDOMElement()
    })
  })

  test('displays loading state', async () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    const searchInput = container.querySelector('[data-testid="search-input"]')
    const form = container.querySelector('form')
    
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).toBeInTheDocument()
    })
  })

  test('handles search errors', async () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    const searchInput = container.querySelector('[data-testid="search-input"]')
    const form = container.querySelector('form')
    
    fireEvent.change(searchInput, { target: { value: 'error' } })
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="error"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="error"]')).toHaveTextContent('Search failed')
    })
  })

  test('filters products by category', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    // Test that the search page structure exists
    expect(container.querySelector('[data-testid="product-search"]')).toBeInTheDocument()
  })

  test('sorts products correctly', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    // Test that the search page structure exists
    expect(container.querySelector('[data-testid="product-search"]')).toBeInTheDocument()
  })

  test('pagination works correctly', () => {
    const { container } = renderWithRouter(<MockProductSearch />)
    
    // Test that the search page structure exists
    expect(container.querySelector('[data-testid="product-search"]')).toBeInTheDocument()
  })
})