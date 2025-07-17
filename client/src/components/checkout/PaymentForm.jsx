import { CreditCard } from 'lucide-react'

const PaymentForm = ({ formData, onChange }) => {
  const handleInputChange = (e) => {
    onChange(e)
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CreditCard size={20} className="mr-2" />
        Payment Information
      </h2>

      <div className="mb-4">
        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name *
        </label>
        <input
          id="cardName"
          name="cardName"
          type="text"
          required
          value={formData.cardName || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Card Number *
        </label>
        <input
          id="cardNumber"
          name="cardNumber"
          type="text"
          required
          value={formData.cardNumber || ''}
          onChange={handleInputChange}
          placeholder="1234 5678 9012 3456"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            id="expiryDate"
            name="expiryDate"
            type="text"
            required
            value={formData.expiryDate || ''}
            onChange={handleInputChange}
            placeholder="MM/YY"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
            CVV *
          </label>
          <input
            id="cvv"
            name="cvv"
            type="text"
            required
            value={formData.cvv || ''}
            onChange={handleInputChange}
            placeholder="123"
            maxLength="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your payment information is secure and encrypted
        </div>
      </div>
    </div>
  )
}

export default PaymentForm