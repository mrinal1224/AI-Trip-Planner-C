import { useEffect, useState } from 'react'
import { Navigate, NavLink } from 'react-router-dom'
import PageWrapper from '../../components/ui/PageWrapper'
import AuthCard from '../../components/auth/AuthCard'
import AuthErrorBanner from '../../components/auth/AuthErrorBanner'
import AuthTextField from '../../components/auth/AuthTextField'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { useAuth } from '../../context/AuthContext'
import { getFriendlyAuthError } from '../../services/firebase/authService'

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export default function Login() {
  const { user, loading, loginWithEmail, loginWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) setFormError('')
  }, [loading, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setFormError('Email is required.')
    if (!validateEmail(trimmedEmail)) return setFormError('Please enter a valid email address.')
    if (!password) return setFormError('Password is required.')
    if (password.length < 6)
      return setFormError('Password must be at least 6 characters.')

    try {
      setSubmitting(true)
      await loginWithEmail(trimmedEmail, password)
    } catch (err) {
      setFormError(getFriendlyAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle(e) {
    e.preventDefault()
    setFormError('')

    try {
      setSubmitting(true)
      await loginWithGoogle()
    } catch (err) {
      setFormError(getFriendlyAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen label="Checking session..." />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <PageWrapper title="Login" description="Sign in to manage your trips.">
      <AuthCard
        title="Welcome back"
        description="Log in with email/password or Google."
      >
        <AuthErrorBanner message={formError} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthTextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />

          <AuthTextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : 'Continue with Google'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <NavLink
            to="/signup"
            className="font-semibold text-brand-600 hover:underline"
          >
            Sign up
          </NavLink>
        </div>
      </AuthCard>
    </PageWrapper>
  )
}

