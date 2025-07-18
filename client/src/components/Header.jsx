import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, User, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'

const Header = () => {
  const { getCartItemCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const cartItemCount = getCartItemCount()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ShoppingCart size={32} />
            <span>QuickCart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Categories
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart size={20} />
              <span>Cart ({cartItemCount})</span>
            </Link>

            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-md"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">{user?.first_name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="inline w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              
              {/* Mobile Auth Links */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    to="/profile" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link 
                    to="/login" 
                    className="block text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header