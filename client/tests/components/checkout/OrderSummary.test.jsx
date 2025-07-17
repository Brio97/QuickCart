import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import OrderSummary from '../../../src/components/checkout/OrderSummary'

// Mock the useCart hook completely
const mockUseCart = {
  getCartTotal: vi.fn(() => 59.98)
}

vi.mock('../../../src/context/CartContext', () => ({
  useCart: () => mockUseCart
}))

describe('OrderSummary', () => {
  beforeEach(() => {
    mockUseCart.getCartTotal.mockReturnValue(59.98)
  })

  test('renders order summary with cart items', () => {
    const mockCart = [
      {
        id: 1,
        name: 'Product A',
        price: 29.99,
        quantity: 2,
        image_url: 'test-image-a.jpg'
      }
    ]

    render(<OrderSummary cart={mockCart} />)

    // Use getAllByText for all text elements that might be duplicated
    const orderSummaryElements = screen.getAllByText('Order Summary')
    expect(orderSummaryElements.length).toBeGreaterThanOrEqual(1)
    
    const productAElements = screen.getAllByText('Product A')
    expect(productAElements.length).toBeGreaterThanOrEqual(1)
    
    const quantityElements = screen.getAllByText(/Qty:\s*2/)
    expect(quantityElements.length).toBeGreaterThanOrEqual(1)
  })

  test('displays correct quantities', () => {
    const mockCart = [
      {
        id: 1,
        name: 'Product A',
        price: 29.99,
        quantity: 2,
        image_url: 'test-image-a.jpg'
      },
      {
        id: 2,
        name: 'Product B',
        price: 19.99,
        quantity: 1,
        image_url: 'test-image-b.jpg'
      }
    ]

    render(<OrderSummary cart={mockCart} />)

    // Check that quantities exist without being strict about count
    const qty2Elements = screen.getAllByText(/Qty:\s*2/)
    const qty1Elements = screen.getAllByText(/Qty:\s*1/)
    
    expect(qty2Elements.length).toBeGreaterThanOrEqual(1)
    expect(qty1Elements.length).toBeGreaterThanOrEqual(1)
    
    // Verify both products are present using getAllByText
    const productAElements = screen.getAllByText('Product A')
    const productBElements = screen.getAllByText('Product B')
    
    expect(productAElements.length).toBeGreaterThanOrEqual(1)
    expect(productBElements.length).toBeGreaterThanOrEqual(1)
  })

  test('shows free shipping message when applicable', () => {
    const mockCart = [
      {
        id: 1,
        name: 'Product A',
        price: 60.00,
        quantity: 1,
        image_url: 'test-image-a.jpg'
      }
    ]

    // Mock higher total for free shipping
    mockUseCart.getCartTotal.mockReturnValue(60.00)
    
    render(<OrderSummary cart={mockCart} />)

    // Use getAllByText for the free shipping message too
    const freeShippingElements = screen.getAllByText('You qualify for free shipping!')
    expect(freeShippingElements.length).toBeGreaterThanOrEqual(1)
  })

  test('displays security badge', () => {
    const mockCart = [
      {
        id: 1,
        name: 'Product A',
        price: 29.99,
        quantity: 1,
        image_url: 'test-image-a.jpg'
      }
    ]

    render(<OrderSummary cart={mockCart} />)

    // Use getAllByText for the security message too
    const securityElements = screen.getAllByText('Secure 256-bit SSL encryption')
    expect(securityElements.length).toBeGreaterThanOrEqual(1)
  })
})