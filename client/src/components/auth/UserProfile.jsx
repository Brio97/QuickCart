import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserProfile, updateUserProfile } from '../../services/api'
import { User, Edit2, Save, X, Package, Calendar } from 'lucide-react'
import ErrorMessage from '../ErrorMessage'
import LoadingSpinner from '../LoadingSpinner'

const UserProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getUserProfile()
      setProfile(data)
      setEditForm({
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        email: data.user.email || ''
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updatedUser = await updateUserProfile(editForm)
      updateUser(updatedUser)
      setProfile(prev => ({
        ...prev,
        user: updatedUser
      }))
      setIsEditing(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      first_name: profile.user.first_name || '',
      last_name: profile.user.last_name || '',
      email: profile.user.email || ''
    })
    setIsEditing(false)
    setError(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.user.first_name} {profile.user.last_name}
                  </h1>
                  <p className="text-gray-600">{profile.user.email}</p>
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditSubmit}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="px-6 py-6 border-b border-gray-200">
              {error && <ErrorMessage message={error} />}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </form>
            </div>
          )}

          {/* Order History */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order History
            </h2>
            
            {profile.orders && profile.orders.length > 0 ? (
              <div className="space-y-4">
                {profile.orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-gray-600">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span>${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Start shopping to see your order history here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
