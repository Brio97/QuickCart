import { useCart } from '../../context/CartContext'

const OrderSummary = ({ cart }) => {
  const { getCartTotal } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={item.image_url || '/placeholder-image.jpg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
              <p className="text-sm text-gray-600">
                {formatPrice(item.price)} each
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between text-lg font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm">
          <p className="font-medium text-blue-900 mb-1">Free Shipping</p>
          <p className="text-blue-700">
            {subtotal >= 50 
              ? "You qualify for free shipping!" 
              : `Add ${formatPrice(50 - subtotal)} more for free shipping`
            }
          </p>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Secure 256-bit SSL encryption
      </div>
    </div>
  )
}

export default OrderSummary
