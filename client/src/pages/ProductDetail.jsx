import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Plus, Minus, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fetchProduct } from '../services/api' // Changed from fetchProductById to fetchProduct
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, updateQuantity, getCartItemQuantity } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  const cartQuantity = getCartItemQuantity(parseInt(id))

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProduct(id) // Using fetchProduct instead of fetchProductById
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAddToCart = () => {
    for (let i = 0; i < selectedQuantity; i++) {
      addToCart(product)
    }
  }

  const handleIncreaseQuantity = () => {
    if (cartQuantity > 0) {
      updateQuantity(product.id, cartQuantity + 1)
    } else {
      addToCart(product)
    }
  }

  const handleDecreaseQuantity = () => {
    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1)
    } else {
      updateQuantity(product.id, 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="py-20" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage 
            message={error} 
            onRetry={() => window.location.reload()} 
            className="max-w-md mx-auto mt-20"
          />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product not found
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={product.image_url || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.category && (
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {product.category}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating (placeholder) */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.5 out of 5)</span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">
                      {product.stock_quantity > 5 
                        ? 'In Stock' 
                        : `Only ${product.stock_quantity} left`
                      }
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Add to Cart Section */}
              {product.stock_quantity > 0 && (
                <div className="space-y-4">
                  {cartQuantity === 0 ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 font-medium">
                          {selectedQuantity}
                        </span>
                        <button
                          onClick={() => setSelectedQuantity(Math.min(product.stock_quantity, selectedQuantity + 1))}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart size={20} className="mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-900">
                        In Cart: {cartQuantity}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleDecreaseQuantity}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <button
                          onClick={handleIncreaseQuantity}
                          disabled={cartQuantity >= product.stock_quantity}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Out of Stock Button */}
              {product.stock_quantity === 0 && (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail