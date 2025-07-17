import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, CreditCard, ArrowRight } from 'lucide-react'

const OrderConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    // Get order details from navigation state
    if (location.state) {
      setOrderDetails(location.state)
    } else {
      // If no state, redirect to home (shouldn't access this page directly)
      navigate('/')
    }
  }, [location.state, navigate])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatOrderNumber = (orderNumber) => {
    return orderNumber?.toString().padStart(8, '0') || 'N/A'
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Order Details
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  #{formatOrderNumber(orderDetails.orderNumber)}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 sm:text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(orderDetails.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Confirmed</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">Processing</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                  <Truck className="h-5 w-5 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">Shipped</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• We'll notify you when your order is being processed</li>
              <li>• Tracking information will be sent once your order ships</li>
              <li>• Estimated delivery: 3-5 business days</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Print Receipt
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@quickcart.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              support@quickcart.com
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+1-555-0123"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              📞 1-555-0123
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
