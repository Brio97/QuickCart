import { useState } from 'react'
import { Lock } from 'lucide-react'
import ShippingForm from './ShippingForm'
import PaymentForm from './PaymentForm'

const CheckoutForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    // Shipping fields
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    // Payment fields
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    // Additional fields
    notes: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <ShippingForm 
          formData={formData} 
          onChange={handleInputChange} 
        />
        
        <PaymentForm 
          formData={formData} 
          onChange={handleInputChange} 
        />

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special instructions for your order..."
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Lock size={20} className="mr-2" />
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}

export default CheckoutForm