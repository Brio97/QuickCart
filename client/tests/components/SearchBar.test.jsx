import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import SearchBar from '../../src/components/SearchBar'

describe('SearchBar', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    mockOnSearch.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  test('renders search input', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)
    
    // Use container to find the specific input within this component
    const input = container.querySelector('input[placeholder*="Search"]')
    expect(input).toBeInTheDocument()
  })

  test('calls onSearch when form is submitted', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)

    // Use container to avoid multiple element issues
    const input = container.querySelector('input[placeholder*="Search"]')
    const form = container.querySelector('form')
    
    expect(input).toBeInTheDocument()
    expect(form).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.submit(form)

    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  test('maintains input value after search', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)

    const input = container.querySelector('input[placeholder*="Search"]')
    const form = container.querySelector('form')

    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.submit(form)

    expect(input.value).toBe('test query')
  })

  test('renders search icon', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)
    
    // Look for the search icon SVG
    const searchIcon = container.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  test('handles empty search input', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)

    const input = container.querySelector('input[placeholder*="Search"]')
    const form = container.querySelector('form')

    fireEvent.submit(form)

    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  test('updates input value when typing', () => {
    const { container } = render(<SearchBar onSearch={mockOnSearch} />)

    const input = container.querySelector('input[placeholder*="Search"]')

    fireEvent.change(input, { target: { value: 'new search' } })

    expect(input.value).toBe('new search')
  })
})