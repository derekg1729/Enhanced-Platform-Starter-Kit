import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginButton from '@/app/app/(auth)/login/login-button'
import { signIn } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

describe('LoginButton', () => {
  it('renders login button', () => {
    render(<LoginButton />)
    expect(screen.getByText(/Login with GitHub/i)).toBeInTheDocument()
  })

  it('calls signIn when clicked', async () => {
    render(<LoginButton />)
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    expect(signIn).toHaveBeenCalledWith('github')
  })

  it('shows loading state when clicked', async () => {
    render(<LoginButton />)
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    expect(button).toBeDisabled()
  })
}) 