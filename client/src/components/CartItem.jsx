import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    }
  }

  const handleRemoveItem = () => {
    removeFromCart(item.id)
  }

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16">
        <img
          src={item.image_url || '/placeholder-image.jpg'}
          alt={item.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500">
          {formatPrice(item.price)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecreaseQuantity}
          className="p-1 rounded-md hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <button
          onClick={handleIncreaseQuantity}
          className="p-1 rounded-md hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-sm font-medium text-gray-900">
        {formatPrice(item.price * item.quantity)}
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemoveItem}
        className="p-1 text-red-500 hover:text-red-700"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default CartItem