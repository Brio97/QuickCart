import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { CartProvider, useCart } from '../../src/context/CartContext'

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

// Test component that uses the cart context
const TestComponent = () => {
  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCart()

  const handleAddToCart = () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 10,
      image_url: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock_quantity: 10
    }
    addToCart(product)
  }

  return (
    <div>
      <div data-testid="cart-count">{items.length}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="total-items">{getCartItemCount()}</div>
      <button data-testid="add-item" onClick={handleAddToCart}>
        Add Item
      </button>
      <button data-testid="update-quantity" onClick={() => updateQuantity(1, 2)}>
        Update Quantity
      </button>
      <button data-testid="remove-item" onClick={() => removeFromCart(1)}>
        Remove Item
      </button>
      <button data-testid="clear-cart" onClick={() => clearCart()}>
        Clear Cart
      </button>
      {/* Debug info */}
      <div data-testid="debug-cart">{JSON.stringify(items)}</div>
    </div>
  )
}

const renderWithCartProvider = () => {
  cleanup()
  return render(
    <CartProvider>
      <TestComponent />
    </CartProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    cleanup()
  })

  test('should start with empty cart', () => {
    const { container } = renderWithCartProvider()

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
    expect(screen.getByTestId('total-items')).toHaveTextContent('0')
  })

  test('should add product to cart', async () => {
    const { container } = renderWithCartProvider()

    // Check initial state
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0')

    // Use container.querySelector to avoid duplicate element issues
    const addButton = container.querySelector('[data-testid="add-item"]')
    fireEvent.click(addButton)

    // Wait for the state to update
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    }, { timeout: 3000 })

    expect(screen.getByTestId('total-items')).toHaveTextContent('1')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('10')
  })

  test('should update quantity', async () => {
    const { container } = renderWithCartProvider()

    // Add item first
    const addButton = container.querySelector('[data-testid="add-item"]')
    fireEvent.click(addButton)

    // Wait for item to be added
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    })

    // Update quantity
    const updateButton = container.querySelector('[data-testid="update-quantity"]')
    fireEvent.click(updateButton)

    // Wait for quantity to update
    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('2')
    })

    expect(screen.getByTestId('cart-total')).toHaveTextContent('20')
  })

  test('should remove item from cart', async () => {
    const { container } = renderWithCartProvider()

    // Add item first
    const addButton = container.querySelector('[data-testid="add-item"]')
    fireEvent.click(addButton)

    // Wait for item to be added
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    })

    // Remove item
    const removeButton = container.querySelector('[data-testid="remove-item"]')
    fireEvent.click(removeButton)

    // Wait for item to be removed
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    })

    expect(screen.getByTestId('total-items')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
  })

  test('should clear cart', async () => {
    const { container } = renderWithCartProvider()

    // Add item first
    const addButton = container.querySelector('[data-testid="add-item"]')
    fireEvent.click(addButton)

    // Wait for item to be added
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1')
    })

    // Clear cart
    const clearButton = container.querySelector('[data-testid="clear-cart"]')
    fireEvent.click(clearButton)

    // Wait for cart to be cleared
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0')
    })

    expect(screen.getByTestId('total-items')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0')
  })
})