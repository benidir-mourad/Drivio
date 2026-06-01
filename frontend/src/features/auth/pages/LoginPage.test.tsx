import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './LoginPage'
import { ToastProvider } from '../../../shared/hooks/useToast'

vi.mock('../hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ToastProvider>
          {children}
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByLabelText('Adresse email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })
})
