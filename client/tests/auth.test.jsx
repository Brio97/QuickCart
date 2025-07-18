import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../src/components/auth/Login'
import Register from '../src/components/auth/Register'
import { AuthProvider } from '../src/context/AuthContext'

// Mock the API module
vi.mock('../src/services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  setAuthToken: vi.fn()
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
const mockLocation = { state: null, pathname: '/test' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
  }
})

import * as api from '../src/services/api'

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    
    api.login.mockResolvedValue({
      success: true,
      token: 'fake-token',
      user: { id: 1, email: 'test@example.com', first_name: 'Test' }
    })

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    
    api.login.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form correctly', () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    const user = userEvent.setup()
    
    api.register.mockResolvedValue({
      success: true,
      token: 'fake-token',
      user: { id: 1, email: 'test@example.com', first_name: 'Test' }
    })

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    await user.type(screen.getByPlaceholderText('First name'), 'Test')
    await user.type(screen.getByPlaceholderText('Last name'), 'User')
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User'
      })
    })
  })

  it('shows validation error for password mismatch', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    )

    await user.type(screen.getByPlaceholderText('First name'), 'Test')
    await user.type(screen.getByPlaceholderText('Last name'), 'User')
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'differentpassword')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })
})
