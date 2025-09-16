'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckIcon } from '@/components/ui/icons'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  retryAttempts: number
  timeout: number
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    isActive: true,
    retryAttempts: 3,
    timeout: 30000
  })

  const availableEvents = [
    'lead.created',
    'lead.updated',
    'user.created',
    'user.merged',
    'event.created',
    'fraud.detected',
    'campaign.updated'
  ]

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks')
      const data = await response.json()

      if (data.success) {
        setWebhooks(data.webhooks)
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchWebhooks()
        setShowCreateForm(false)
        setFormData({
          name: '',
          url: '',
          secret: '',
          events: [],
          isActive: true,
          retryAttempts: 3,
          timeout: 30000
        })
      } else {
        alert('Failed to create webhook: ' + data.error)
      }
    } catch (error) {
      console.error('Create webhook error:', error)
      alert('Failed to create webhook')
    }
  }

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        alert('Webhook test successful!')
      } else {
        alert(`Webhook test failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Test webhook error:', error)
      alert('Failed to test webhook')
    }
  }

  const handleEventChange = (event: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        events: [...prev.events, event]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        events: prev.events.filter(e => e !== event)
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">System Settings</h1>
          <p className="text-gray-600">Manage webhooks, integrations, and system configuration</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Add Webhook
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center">
              <CheckIcon size={24} className="mr-2" />
              Healthy
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-number">{webhooks.filter(w => w.isActive).length}</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">API Rate Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-gray-500">Unlimited</div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">365d</div>
            <div className="text-xs text-gray-500">Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Webhook Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Webhook</CardTitle>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={createWebhook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Lead notifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <Input
                    required
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-app.com/webhook"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret
                  </label>
                  <Input
                    required
                    type="password"
                    value={formData.secret}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="webhook-secret-key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout (ms)
                  </label>
                  <Input
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                    min="1000"
                    max="60000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events to Subscribe
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableEvents.map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={(e) => handleEventChange(event, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <Button type="submit">
                Create Webhook
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-lg">No webhooks configured</div>
              <div className="text-sm">Create your first webhook to receive real-time notifications</div>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          webhook.isActive ? 'bg-green-100 text-primary' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        <div>URL: {webhook.url}</div>
                        <div>Events: {webhook.events.join(', ')}</div>
                        <div>Retry attempts: {webhook.retryAttempts} | Timeout: {webhook.timeout}ms</div>
                        <div>Created: {new Date(webhook.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook.id)}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">API Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rate Limiting:</span>
                  <span className="text-primary">Disabled</span>
                </div>
                <div className="flex justify-between">
                  <span>API Version:</span>
                  <span>v1.0</span>
                </div>
                <div className="flex justify-between">
                  <span>CORS:</span>
                  <span className="text-primary">Enabled</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Data Management</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Auto-cleanup:</span>
                  <span className="text-foreground">365 days</span>
                </div>
                <div className="flex justify-between">
                  <span>GDPR Compliance:</span>
                  <span className="text-primary">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Encryption:</span>
                  <span className="text-primary">AES-256</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline">
                Export System Config
              </Button>
              <Button variant="outline">
                Generate API Keys
              </Button>
              <Button variant="outline">
                System Health Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}