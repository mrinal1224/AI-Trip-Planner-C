import PageWrapper from '../components/ui/PageWrapper'
import { useEffect, useMemo, useState } from 'react'
import AuthTextField from '../components/auth/AuthTextField'
import SelectField from '../components/forms/SelectField'
import InterestSelector from '../components/forms/InterestSelector'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useAuth } from '../context/AuthContext'
import {
  getDefaultProfileData,
  getUserProfile,
  PROFILE_BUDGET_STYLES,
  PROFILE_INTEREST_OPTIONS,
  PROFILE_PACES,
  PROFILE_TRANSPORT_PREFERENCES,
  PROFILE_TRIP_TYPES,
  updateUserProfile,
} from '../services/firestore'

export default function Profile() {
  const { user } = useAuth()

  const [formState, setFormState] = useState(() => getDefaultProfileData(user))
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [initialSnapshot, setInitialSnapshot] = useState('')

  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : null) || 'Traveler'
  const avatarUrl = user?.photoURL || null
  const avatarFallback = displayName.slice(0, 1).toUpperCase()

  const profileEmail = useMemo(() => {
    return user?.email || formState.email || ''
  }, [formState.email, user?.email])

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      if (!user?.uid) {
        setPageLoading(false)
        return
      }

      setPageLoading(true)
      setError('')
      setSuccess('')

      try {
        const profile = await getUserProfile(user.uid)
        const fallback = getDefaultProfileData(user)

        if (!mounted) return

        setFormState({
          ...fallback,
          ...profile,
          email: user.email || profile?.email || fallback.email,
        })
        setInitialSnapshot(
          JSON.stringify({
            ...fallback,
            ...profile,
            email: user.email || profile?.email || fallback.email,
          }),
        )
      } catch {
        if (!mounted) return
        setError('Unable to load your profile right now. Please refresh.')
      } finally {
        if (mounted) setPageLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [user])

  function updateField(field, value) {
    setSuccess('')
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const currentSnapshot = JSON.stringify({
    ...formState,
    email: profileEmail,
  })
  const hasUnsavedChanges = currentSnapshot !== initialSnapshot

  async function handleSave(event) {
    event.preventDefault()
    if (!user?.uid) return

    setError('')
    setSuccess('')

    if (!formState.name.trim()) {
      setError('Name is required.')
      return
    }

    try {
      setSaving(true)
      await updateUserProfile(user.uid, {
        name: formState.name.trim(),
        email: profileEmail,
        budgetStyle: formState.budgetStyle,
        tripType: formState.tripType,
        interests: formState.interests || [],
        pace: formState.pace,
        transportPreference: formState.transportPreference || 'Mixed',
      })
      setSuccess('Profile preferences saved.')
      setInitialSnapshot(
        JSON.stringify({
          ...formState,
          name: formState.name.trim(),
          email: profileEmail,
          transportPreference: formState.transportPreference || 'Mixed',
        }),
      )
    } catch {
      setError('Could not save profile right now. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) {
    return (
      <PageWrapper title="Profile" description="Loading your profile preferences.">
        <LoadingScreen label="Fetching your profile..." />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Profile"
      description="Manage your personal travel preferences."
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-12 w-12 rounded-full border border-sky-200 object-cover"
            />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-xl font-semibold text-sky-800">
              {avatarFallback}
            </span>
          )}

          <div>
            <div className="text-lg font-semibold text-slate-900">{displayName}</div>
            {user?.email && (
              <div className="text-sm text-slate-500">{user.email}</div>
            )}
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSave}>
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="text-sm font-medium text-slate-700">
              {hasUnsavedChanges ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <button
              type="submit"
              disabled={saving || !hasUnsavedChanges}
              className="rounded-lg border border-blue-800 bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:border-blue-400 disabled:bg-blue-400 disabled:text-white"
            >
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <AuthTextField
            label="Name"
            name="name"
            placeholder="Your full name"
            value={formState.name}
            onChange={(value) => updateField('name', value)}
            required
          />

          <AuthTextField
            label="Email"
            name="email"
            type="email"
            value={profileEmail}
            onChange={() => {}}
            readOnly
          />

          <SelectField
            id="budgetStyle"
            label="Budget style"
            value={formState.budgetStyle}
            onChange={(value) => updateField('budgetStyle', value)}
            options={PROFILE_BUDGET_STYLES}
          />

          <SelectField
            id="tripType"
            label="Trip type"
            value={formState.tripType}
            onChange={(value) => updateField('tripType', value)}
            options={PROFILE_TRIP_TYPES}
          />

          <InterestSelector
            id="interests"
            label="Interests"
            options={PROFILE_INTEREST_OPTIONS}
            values={formState.interests || []}
            onChange={(value) => updateField('interests', value)}
          />

          <SelectField
            id="pace"
            label="Pace"
            value={formState.pace}
            onChange={(value) => updateField('pace', value)}
            options={PROFILE_PACES}
          />

          <SelectField
            id="transportPreference"
            label="Transport preference"
            value={formState.transportPreference || 'Mixed'}
            onChange={(value) => updateField('transportPreference', value)}
            options={PROFILE_TRANSPORT_PREFERENCES}
            hint="Optional: helps AI prefer routes that match your style."
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !hasUnsavedChanges}
              className="w-full rounded-lg border border-blue-800 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:border-blue-400 disabled:bg-blue-400 disabled:text-white"
            >
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}

