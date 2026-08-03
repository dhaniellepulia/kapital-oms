import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorBanner } from '@/components/shared/ErrorBanner'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../lib/authErrors'
import type { SignupValues } from '../schemas/signupSchema'
import { AuthShell } from '../components/AuthShell'
import { SignupForm } from '../components/SignupForm'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: SignupValues) => {
    setError(null)
    try {
      await signUp(values.name, values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start investing in orders today"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <SignupForm onSubmit={handleSubmit} />
      </div>
    </AuthShell>
  )
}
