import { Link } from 'react-router-dom'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const { addToCart, updateQuantity, getCartItemQuantity } = useCart()
  
  const cartQuantity = getCartItemQuantity(product.id)
  const isInCart = cartQuantity > 0

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAddToCart = () => {
    addToCart(product)
  }

  const handleIncreaseQuantity = () => {
    if (isInCart) {
      updateQuantity(product.id, cartQuantity + 1)
    } else {
      addToCart(product)
    }
  }

  const handleDecreaseQuantity = () => {
    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1)
    } else {
      updateQuantity(product.id, 0) // This should remove the item
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </Link>
        
        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
            {product.category}
          </span>
        )}
        
        {/* Stock Status */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <span className="text-orange-600 text-sm font-medium">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {product.stock_quantity > 0 && (
          <div className="flex items-center justify-between">
            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <button
                  onClick={handleDecreaseQuantity}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                
                <span className="mx-4 font-semibold text-lg">
                  {cartQuantity}
                </span>
                
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={cartQuantity >= product.stock_quantity}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {product.stock_quantity === 0 && (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductCard

