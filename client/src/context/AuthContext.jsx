import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout, setAuthToken } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          setAuthToken(token)
          const userData = await getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          // Clear invalid token
          setAuthToken(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const register = async (userData) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await apiRegister(userData)
      
      if (response.success && response.token) {
        setAuthToken(response.token)
        setUser(response.user)
        return response
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await apiLogin(email, password)
      
      if (response.success && response.token) {
        setAuthToken(response.token)
        setUser(response.user)
        return response
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setError(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}