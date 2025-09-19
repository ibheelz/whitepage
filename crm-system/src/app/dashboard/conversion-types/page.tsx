'use client'

import { useState, useEffect } from 'react'

interface ConversionType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    events: number
    campaigns: number
  }
}

export default function ConversionTypesPage() {
  const [conversionTypes, setConversionTypes] = useState<ConversionType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingType, setEditingType] = useState<ConversionType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchConversionTypes()
  }, [])

  const fetchConversionTypes = async () => {
    try {
      const response = await fetch('/api/conversion-types')
      const data = await response.json()
      if (data.success) {
        setConversionTypes(data.data)
      }
    } catch (error) {
      console.error('Error fetching conversion types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingType
        ? `/api/conversion-types/${editingType.id}`
        : '/api/conversion-types'

      const method = editingType ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        await fetchConversionTypes()
        setShowCreateModal(false)
        setEditingType(null)
        setFormData({ name: '', description: '' })
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving conversion type:', error)
      alert('Error saving conversion type')
    }
  }

  const handleEdit = (conversionType: ConversionType) => {
    setEditingType(conversionType)
    setFormData({
      name: conversionType.name,
      description: conversionType.description || ''
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversion type?')) {
      return
    }

    try {
      const response = await fetch(`/api/conversion-types/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchConversionTypes()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting conversion type:', error)
      alert('Error deleting conversion type')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingType(null)
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Conversion Types
              </h1>
              <p className="text-gray-400 mt-2">
                Manage conversion types that appear as columns in your leads table
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="premium-card hover:border-yellow-400/30 transition-all duration-300 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-500/25"
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Conversion Type
            </button>
          </div>
        </div>

        {/* Conversion Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversionTypes.map((conversionType) => (
            <div
              key={conversionType.id}
              className="premium-card group hover:border-yellow-400/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {conversionType.name}
                  </h3>
                  {conversionType.description && (
                    <p className="text-gray-400 text-sm mb-3">
                      {conversionType.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(conversionType)}
                    className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(conversionType.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Status:</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-md ${
                      conversionType.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {conversionType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Usage:</span>
                  <div className="mt-1 text-white">
                    {conversionType._count?.events || 0} events
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className="text-xs text-gray-500">
                  Created {new Date(conversionType.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {conversionTypes.length === 0 && (
            <div className="col-span-full">
              <div className="premium-card text-center py-12">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No conversion types yet</h3>
                <p className="text-gray-400 mb-6">Create your first conversion type to start tracking conversions in your leads table.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
                >
                  Create Conversion Type
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="premium-card max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingType ? 'Edit Conversion Type' : 'Create Conversion Type'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                    placeholder="e.g., First Deposit, Registration, Purchase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors resize-none"
                    placeholder="Optional description for this conversion type"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
                  >
                    {editingType ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}