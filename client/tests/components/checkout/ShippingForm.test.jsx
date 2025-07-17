import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import ShippingForm from '../../../src/components/checkout/ShippingForm'

describe('ShippingForm', () => {
  const defaultFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  }

  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test('renders all required form fields', () => {
    render(<ShippingForm formData={defaultFormData} onChange={mockOnChange} />)
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
  })

  test('calls onChange when input values change', () => {
    render(<ShippingForm formData={defaultFormData} onChange={mockOnChange} />)
    
    const firstNameInput = screen.getByLabelText(/first name/i)
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Jane' } })
    
    expect(mockOnChange).toHaveBeenCalled()
  })
})