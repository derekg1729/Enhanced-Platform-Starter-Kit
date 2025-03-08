import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import useSWR from 'swr'
import { createMockSite, mockFetchResponse, Wrapper } from '../../__helpers__/test-utils'
import React from 'react'

// Example component using SWR
const SiteList = () => {
  const { data, error, isLoading } = useSWR('/api/sites', async () => {
    const res = await fetch('/api/sites')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null

  return (
    <ul>
      {data.sites.map((site: any) => (
        <li key={site.id}>{site.name}</li>
      ))}
    </ul>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>
    }

    return this.props.children
  }
}

describe('Data Fetching Patterns', () => {
  describe('SWR Usage', () => {
    it('should show loading state', () => {
      global.fetch = vi.fn()
      render(<SiteList />, { wrapper: Wrapper })
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should handle successful data fetch', async () => {
      const mockSites = [
        createMockSite({ name: 'Site 1' }),
        createMockSite({ name: 'Site 2', id: 'site-2' })
      ]

      global.fetch = vi.fn().mockResolvedValueOnce(
        mockFetchResponse({ sites: mockSites })
      )

      render(<SiteList />, { wrapper: Wrapper })

      // Should show loading first
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Then should show the data
      await waitFor(() => {
        expect(screen.getByText('Site 1')).toBeInTheDocument()
        expect(screen.getByText('Site 2')).toBeInTheDocument()
      })
    })

    it('should handle error state', async () => {
      // Mock a failed fetch
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<SiteList />, { wrapper: Wrapper })

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Error Boundaries', () => {
    it('should catch and handle runtime errors', () => {
      const BrokenComponent = () => {
        throw new Error('Test error')
      }

      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should handle progressive loading patterns', async () => {
      const mockSlow = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(mockFetchResponse({ sites: [] }))
          }, 1000)
        })
      })

      global.fetch = mockSlow

      render(<SiteList />, { wrapper: Wrapper })

      // Initial loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Wait for slow data
      await waitFor(
        () => {
          expect(mockSlow).toHaveBeenCalled()
        },
        { timeout: 2000 }
      )
    })
  })
}) 