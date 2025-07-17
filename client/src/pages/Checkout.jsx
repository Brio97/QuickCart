import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { submitOrder } from '../services/api'
import CheckoutForm from '../components/checkout/CheckoutForm'
import OrderSummary from '../components/checkout/OrderSummary'

const Checkout = () => {
  const navigate = useNavigate()
  const { items: cart, getCartTotal, clearCart } = useCart() // <-- Changed cart to items: cart
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleOrderSubmit = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country
        },
        payment_info: {
          card_number: formData.cardNumber,
          expiry_date: formData.expiryDate,
          cvv: formData.cvv,
          card_name: formData.cardName
        },
        total_amount: getCartTotal(),
        notes: formData.notes
      }

      const response = await submitOrder(orderData)
      
      if (response.success) {
        clearCart()
        navigate('/order-confirmation', { 
          state: { 
            orderNumber: response.order_number,
            totalAmount: response.total_amount 
          }
        })
      } else {
        setError(response.message || 'Failed to process order')
      }
    } catch (err) {
      setError(err.message || 'Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <CheckoutForm 
            onSubmit={handleOrderSubmit}
            loading={loading}
            error={error}
          />
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default Checkout