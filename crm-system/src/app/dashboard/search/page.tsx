'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailIcon, PhoneIcon, LocationIcon } from '@/components/ui/icons'

interface SearchResult {
  id: string
  masterEmail: string | null
  masterPhone: string | null
  firstName: string | null
  lastName: string | null
  country: string | null
  city: string | null
  createdAt: string
  identifiers: Array<{
    type: string
    value: string
    isVerified: boolean
    isPrimary: boolean
  }>
  _count: {
    clicks: number
    leads: number
    events: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Failed to perform search')
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = (user: SearchResult) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.masterEmail || user.masterPhone || 'Unknown User'
  }

  const getLocation = (user: SearchResult) => {
    if (user.city && user.country) {
      return `${user.city}, ${user.country}`
    }
    return user.country || 'Unknown location'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        {query && (
          <p className="text-gray-600">
            Search results for: <span className="font-medium">"{query}"</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">Searching...</div>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  No users found matching your search criteria.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="text-lg font-medium text-foreground hover:text-foreground"
                        >
                          {getDisplayName(user)}
                        </Link>

                        <div className="mt-2 space-y-1">
                          {user.masterEmail && (
                            <div className="text-sm text-gray-600">
                              <EmailIcon size={16} className="inline mr-1" />{user.masterEmail}
                            </div>
                          )}
                          {user.masterPhone && (
                            <div className="text-sm text-gray-600">
                              <PhoneIcon size={16} className="inline mr-1" />{user.masterPhone}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            <LocationIcon size={16} className="inline mr-1" />{getLocation(user)}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {user.identifiers.slice(0, 3).map((identifier, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                identifier.isPrimary
                                  ? 'bg-blue-100 text-foreground'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {identifier.type}: {identifier.value}
                              {identifier.isVerified && ' ✓'}
                            </span>
                          ))}
                          {user.identifiers.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{user.identifiers.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-sm text-gray-600">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <div>{user._count.clicks} clicks</div>
                          <div>{user._count.leads} leads</div>
                          <div>{user._count.events} events</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}