import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import ProductCard from '../../src/components/ProductCard'
import { CartProvider } from '../../src/context/CartContext'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'This is a test product description',
  price: 29.99,
  image_url: 'https://example.com/image.jpg',
  category: 'electronics',
  stock_quantity: 1
}

const renderWithProviders = (product = mockProduct) => {
  cleanup() // Clean up before each render
  return render(
    <BrowserRouter>
      <CartProvider>
        <ProductCard product={product} />
      </CartProvider>
    </BrowserRouter>
  )
}

describe('ProductCard', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
  })

  test('renders product information correctly', () => {
    renderWithProviders()
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('This is a test product description')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('electronics')).toBeInTheDocument()
    expect(screen.getByText('Only 1 left')).toBeInTheDocument()
  })

  test('renders product image with correct alt text', () => {
    const { container } = renderWithProviders()
    
    // Use container.querySelector to avoid duplicate element issues
    const image = container.querySelector('img[alt="Test Product"]')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  test('shows add to cart button when product is in stock and not in cart', () => {
    renderWithProviders()
    
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  test('shows quantity controls when item is in cart', () => {
    const { container } = renderWithProviders()
    
    // First add item to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    // Check for quantity controls
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument()
  })

  test('increase button is disabled when quantity equals stock', () => {
    renderWithProviders()
    
    // Add item to cart first
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    // Check that increase button is disabled (stock is 1, quantity is 1)
    const increaseButton = screen.getByLabelText('Increase quantity')
    expect(increaseButton).toBeDisabled()
  })

  test('shows correct stock message for low stock (5 or less)', () => {
    renderWithProviders()
    
    expect(screen.getByText('Only 1 left')).toBeInTheDocument()
  })

  test('does not show stock message for normal stock levels', () => {
    const productWithNormalStock = { ...mockProduct, stock_quantity: 10 }
    renderWithProviders(productWithNormalStock)
    
    expect(screen.queryByText(/Only \d+ left/)).not.toBeInTheDocument()
  })

  test('shows out of stock overlay and disabled button when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock_quantity: 0 }
    const { container } = renderWithProviders(outOfStockProduct)
    
    // Check for the overlay span specifically
    const overlay = container.querySelector('.absolute.inset-0 span')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveTextContent('Out of Stock')
    
    // Check for the disabled button specifically
    const button = screen.getByRole('button', { name: /out of stock/i })
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Out of Stock')
  })

  test('product links work correctly', () => {
    const { container } = renderWithProviders()
    
    const productLinks = container.querySelectorAll('a[href="/products/1"]')
    expect(productLinks.length).toBeGreaterThan(0)
    productLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/products/1')
    })
  })

  test('handles add to cart functionality', () => {
    renderWithProviders()
    
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    // Should show quantity controls after adding
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument()
  })

  test('handles quantity increase', () => {
    const productWithMoreStock = { ...mockProduct, stock_quantity: 5 }
    renderWithProviders(productWithMoreStock)
    
    // Add to cart first
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    // Now increase quantity
    const increaseButton = screen.getByLabelText('Increase quantity')
    fireEvent.click(increaseButton)
    
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('handles quantity decrease', () => {
    const productWithMoreStock = { ...mockProduct, stock_quantity: 5 }
    renderWithProviders(productWithMoreStock)
    
    // Add to cart and increase quantity
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    const increaseButton = screen.getByLabelText('Increase quantity')
    fireEvent.click(increaseButton)
    
    // Now decrease
    const decreaseButton = screen.getByLabelText('Decrease quantity')
    fireEvent.click(decreaseButton)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  test('removes item when quantity decreased to 0', () => {
    renderWithProviders()
    
    // Add to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)
    
    // Decrease to 0
    const decreaseButton = screen.getByLabelText('Decrease quantity')
    fireEvent.click(decreaseButton)
    
    // Should show Add to Cart button again
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  test('formats price correctly', () => {
    renderWithProviders()
    
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  test('handles missing image with placeholder', () => {
    const productWithoutImage = { ...mockProduct, image_url: null }
    const { container } = renderWithProviders(productWithoutImage)
    
    const image = container.querySelector('img')
    expect(image).toHaveAttribute('src', '/placeholder-image.jpg')
  })

  test('does not show category badge when category is missing', () => {
    const productWithoutCategory = { ...mockProduct, category: null }
    renderWithProviders(productWithoutCategory)
    
    expect(screen.queryByText('electronics')).not.toBeInTheDocument()
  })
})