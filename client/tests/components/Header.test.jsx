import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import Header from '../../src/components/Header'
import { CartProvider } from '../../src/context/CartContext'
import { AuthProvider } from '../../src/context/AuthContext'

// Mock API
vi.mock('../../src/services/api', () => ({
  getCurrentUser: vi.fn(),
  setAuthToken: vi.fn()
}))

// Mock SearchBar component
vi.mock('../../src/components/SearchBar', () => {
  return {
    default: function MockSearchBar({ onClose }) {
      return (
        <div data-testid="search-bar">
          <input placeholder="Search products..." />
          <button onClick={onClose}>Close</button>
        </div>
      )
    }
  }
})

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = ''
  })

  test('renders logo and navigation links', () => {
    renderWithProviders()
    
    expect(screen.getByText('QuickCart')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  test('displays cart icon with item count', () => {
    renderWithProviders()
    
    // Use getAllByText and check the first one
    const cartElements = screen.getAllByText(/Cart \(/i)
    expect(cartElements[0]).toBeInTheDocument()
    expect(cartElements[0]).toHaveTextContent('Cart (0)')
  })

  test('cart icon shows 0 when cart is empty', () => {
    renderWithProviders()
    
    const cartElements = screen.getAllByText(/Cart \(/i)
    expect(cartElements[0]).toHaveTextContent('Cart (0)')
  })

  test('search functionality works', () => {
    renderWithProviders()
    
    const searchButton = screen.getByLabelText('Search')
    fireEvent.click(searchButton)
    
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  test('mobile menu toggle works', () => {
    renderWithProviders()
    
    const menuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(menuButton)
    
    // The mobile menu should show the navigation links
    // Since we already have Home, Products, Categories visible on desktop,
    // we need to check if they're duplicated (mobile menu opened)
    const homeLinks = screen.getAllByText('Home')
    expect(homeLinks.length).toBeGreaterThan(1) // Desktop + Mobile
  })
})