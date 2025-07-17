import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CheckoutForm from '../../../src/components/checkout/CheckoutForm'

// Mock the child components
vi.mock('../../../src/components/checkout/ShippingForm', () => {
    return {
      default: function MockShippingForm({ formData, onChange }) {
        return (
          <div data-testid="shipping-form">
            <input 
              data-testid="first-name"
              value={formData.firstName}
              onChange={(e) => onChange({ target: { name: 'firstName', value: e.target.value } })}
            />
          </div>
        )
      }
    }
})

vi.mock('../../../src/components/checkout/PaymentForm', () => {
  return {
    default: function MockPaymentForm({ formData, onChange }) {
      return <div data-testid="payment-form">Payment Form</div>
    }
  }
})

describe('CheckoutForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  test('renders shipping and payment forms', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} loading={false} error={null} />)
    
    expect(screen.getByTestId('shipping-form')).toBeInTheDocument()
    expect(screen.getByTestId('payment-form')).toBeInTheDocument()
  })

  test('displays error message when provided', () => {
    render(<CheckoutForm onSubmit={mockOnSubmit} loading={false} error="Test error" />)
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
})