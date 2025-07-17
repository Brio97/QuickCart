import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PaymentForm from '../../../src/components/checkout/PaymentForm'

describe('PaymentForm', () => {
  const defaultFormData = {
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  }

  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test('renders all payment form fields', () => {
    render(<PaymentForm formData={defaultFormData} onChange={mockOnChange} />)
    
    expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument()
  })

  test('calls onChange when input values change', () => {
    render(<PaymentForm formData={defaultFormData} onChange={mockOnChange} />)
    
    const cardNameInput = screen.getByLabelText(/cardholder name/i)
    fireEvent.change(cardNameInput, { target: { name: 'cardName', value: 'John Doe' } })
    
    expect(mockOnChange).toHaveBeenCalled()
  })
})