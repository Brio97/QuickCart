import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import Cart from '../../src/pages/Cart'
import { CartProvider } from '../../src/context/CartContext'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  )
}

describe('Cart Page', () => {
  test('displays empty cart message when cart is empty', () => {
    renderWithProviders()
    expect(screen.getAllByText('Your cart is empty')[0]).toBeInTheDocument()
  })

  test('has continue shopping link', () => {
    renderWithProviders()
    expect(screen.getAllByText('Continue Shopping')[0]).toBeInTheDocument()
  })
})