import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import DomainConfiguration from '@/components/form/domain-configuration'
import { useDomainStatus } from '@/components/form/use-domain-status'
import type { DomainResponse } from '@/lib/types'

// Mock the custom hook
vi.mock('@/components/form/use-domain-status', () => ({
  useDomainStatus: vi.fn(),
}))

describe('DomainConfiguration', () => {
  const mockDomain = 'test.com'

  describe('Domain Verification States', () => {
    it('should not render when status is valid', () => {
      vi.mocked(useDomainStatus).mockReturnValue({
        status: 'Valid Configuration',
        domainJson: undefined,
        loading: false,
      })

      const { container } = render(<DomainConfiguration domain={mockDomain} />)
      expect(container.firstChild).toBeNull()
    })

    it('should show verification instructions when pending', () => {
      const mockDomainJson: DomainResponse & { error: { code: string; message: string } } = {
        name: mockDomain,
        apexName: mockDomain,
        projectId: 'test-project',
        verified: false,
        verification: [{
          type: 'TXT',
          domain: '_vercel.test.com',
          value: 'verification-token',
          reason: 'Pending verification'
        }],
        error: {
          code: 'verification_failed',
          message: 'Domain verification pending'
        }
      }

      vi.mocked(useDomainStatus).mockReturnValue({
        status: 'Pending Verification',
        domainJson: mockDomainJson,
        loading: false,
      })

      render(<DomainConfiguration domain={mockDomain} />)
      expect(screen.getByText('Pending Verification')).toBeInTheDocument()
    })

    it('should show error state for invalid configuration', () => {
      const mockDomainJson: DomainResponse & { error: { code: string; message: string } } = {
        name: mockDomain,
        apexName: mockDomain,
        projectId: 'test-project',
        verified: false,
        verification: [],
        error: {
          code: 'invalid_configuration',
          message: 'Invalid domain configuration'
        }
      }

      vi.mocked(useDomainStatus).mockReturnValue({
        status: 'Invalid Configuration',
        domainJson: mockDomainJson,
        loading: false,
      })

      render(<DomainConfiguration domain={mockDomain} />)
      expect(screen.getByText('Invalid Configuration')).toBeInTheDocument()
    })
  })

  describe('Domain Record Types', () => {
    beforeEach(() => {
      const mockDomainJson: DomainResponse & { error: { code: string; message: string } } = {
        name: mockDomain,
        apexName: mockDomain,
        projectId: 'test-project',
        verified: false,
        verification: [],
        error: {
          code: 'pending_verification',
          message: 'Domain verification pending'
        }
      }

      vi.mocked(useDomainStatus).mockReturnValue({
        status: 'Pending Verification',
        domainJson: mockDomainJson,
        loading: false,
      })
    })

    it('should allow switching between A and CNAME records', () => {
      render(<DomainConfiguration domain={mockDomain} />)
      
      // Find and click the record type toggle using role and name
      const cnameButton = screen.getByRole('button', { name: /CNAME Record/i })
      fireEvent.click(cnameButton)
      
      // Verify CNAME record instructions are shown using a more specific selector
      expect(screen.getByRole('button', { name: /CNAME Record/i })).toHaveClass('border-black')
    })
  })
}) 