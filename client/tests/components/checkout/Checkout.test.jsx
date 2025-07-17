import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import Checkout from '../../../src/pages/Checkout'
import { CartProvider } from '../../../src/context/CartContext'

// Mock the child components
vi.mock('../../../src/components/checkout/CheckoutForm', () => {
    return {
      default: function MockCheckoutForm({ onSubmit, loading, error }) {
        return (
          <div data-testid="checkout-form">
            <button onClick={() => onSubmit({ name: 'Test User' })}>
              Submit Order
            </button>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
          </div>
        )
      }
    }
})

vi.mock('../../../src/components/checkout/OrderSummary', () => {
  return {
    default: function MockOrderSummary({ cart }) {
      return <div data-testid="order-summary">Order Summary</div>
    }
  }
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

const renderWithProviders = (initialCart = []) => {
  cleanup()
  
  // Set up localStorage mock before rendering
  mockLocalStorage.getItem.mockReturnValue(
    initialCart.length > 0 ? JSON.stringify(initialCart) : null
  )
  
  return render(
    <BrowserRouter>
      <CartProvider>
        <Checkout />
      </CartProvider>
    </BrowserRouter>
  )
}

describe('Checkout', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  test('shows empty cart message when cart is empty', () => {
    renderWithProviders([])
    
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  test('renders checkout form and order summary when cart has items', async () => {
    const mockCart = [{ 
      id: 1, 
      name: 'Test Product', 
      price: 29.99, 
      quantity: 1,
      image_url: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock_quantity: 10
    }]
    
    renderWithProviders(mockCart)
    
    // Wait for the cart to load from localStorage
    await waitFor(() => {
      expect(screen.queryByText(/your cart is empty/i)).not.toBeInTheDocument()
    }, { timeout: 1000 })
    
    expect(screen.getByTestId('checkout-form')).toBeInTheDocument()
    expect(screen.getByTestId('order-summary')).toBeInTheDocument()
  })
})