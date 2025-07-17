import { vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the productsAPI that useProducts actually uses
vi.mock('../../src/services/api', () => ({
  productsAPI: {
    getAll: vi.fn()
  }
}))

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches products successfully', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 10.99 }
    ]

    const { productsAPI } = await import('../../src/services/api')
    vi.mocked(productsAPI.getAll).mockResolvedValue({ data: mockProducts })

    const { default: useProducts } = await import('../../src/hooks/useProducts')
    const { result } = renderHook(() => useProducts())

    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(mockProducts)
    expect(result.current.error).toBe(null)
  })

  test('handles API errors', async () => {
    const { productsAPI } = await import('../../src/services/api')
    vi.mocked(productsAPI.getAll).mockRejectedValue(new Error('API Error'))

    const { default: useProducts } = await import('../../src/hooks/useProducts')
    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.products).toEqual([])
  })
})