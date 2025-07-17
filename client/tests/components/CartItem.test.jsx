import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import CartItem from '../../src/components/CartItem'
import { CartProvider } from '../../src/context/CartContext'

const mockItem = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  quantity: 2,
  image_url: 'https://example.com/image.jpg'
}

const renderWithProvider = (item = mockItem) => {
  return render(
    <CartProvider>
      <CartItem item={item} />
    </CartProvider>
  )
}

describe('CartItem', () => {
  beforeEach(() => {
    // Clear DOM before each test
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
  })

  test('renders item information correctly', () => {
    renderWithProvider()
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    // Look for the text that includes "each"
    expect(screen.getByText('$29.99 each')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('renders item image with correct alt text', () => {
    renderWithProvider()
    
    // Use getAllByAltText and check the first one
    const images = screen.getAllByAltText('Test Product')
    expect(images[0]).toBeInTheDocument()
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  test('has working quantity controls', () => {
    renderWithProvider()
    
    const decreaseButton = screen.getByLabelText('Decrease quantity')
    const increaseButton = screen.getByLabelText('Increase quantity')
    
    expect(decreaseButton).toBeInTheDocument()
    expect(increaseButton).toBeInTheDocument()
  })

  test('has remove button', () => {
    renderWithProvider()
    
    const removeButton = screen.getByLabelText('Remove item')
    expect(removeButton).toBeInTheDocument()
  })

  test('calculates total price correctly', () => {
    renderWithProvider()
    
    // 2 items × $29.99 = $59.98
    expect(screen.getByText('$59.98')).toBeInTheDocument()
  })
})