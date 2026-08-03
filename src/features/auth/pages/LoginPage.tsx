import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../lib/authErrors'
import type { LoginValues } from '../schemas/loginSchema'
import { AuthShell } from '../components/AuthShell'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: LoginValues) => {
    setError(null)
    try {
      await signIn(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Kapital account"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <LoginForm onSubmit={handleSubmit} />
      </div>
    </AuthShell>
  )
}
