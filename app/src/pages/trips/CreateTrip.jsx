import PageWrapper from '../../components/ui/PageWrapper'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthTextField from '../../components/auth/AuthTextField'
import InterestSelector from '../../components/forms/InterestSelector'
import SelectField from '../../components/forms/SelectField'
import { useAuth } from '../../context/AuthContext'
import {
  createTrip,
  TRIP_INTEREST_OPTIONS,
  TRIP_PACE_OPTIONS,
} from '../../services/firestore'

export default function CreateTrip() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    interests: [],
    pace: 'Balanced',
    notes: '',
    imageUrl: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(field, value) {
    setError('')
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function validateForm() {
    if (!formData.title.trim()) return 'Trip title is required.'
    if (!formData.destination.trim()) return 'Destination is required.'
    if (!formData.startDate) return 'Start date is required.'
    if (!formData.endDate) return 'End date is required.'
    if (formData.endDate < formData.startDate) return 'End date cannot be before start date.'
    if (Number(formData.travelers) < 1) return 'Travelers should be at least 1.'
    if (!formData.budget || Number(formData.budget) <= 0) return 'Budget should be greater than 0.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!user?.uid) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)
      const tripId = await createTrip({
        userId: user.uid,
        title: formData.title.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: formData.travelers,
        budget: formData.budget,
        interests: formData.interests,
        pace: formData.pace,
        notes: formData.notes.trim(),
        imageUrl: formData.imageUrl.trim(),
      })
      navigate(`/trips/${tripId}`)
    } catch {
      setError('Could not create trip right now. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper
      title="Create Trip"
      description="Fill in trip details and preferences."
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
            <p className="text-sm font-medium text-slate-700">
              Fill the details and save your trip.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
            >
              {saving ? 'Saving...' : 'Save Trip'}
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <AuthTextField
            label="Trip title"
            name="title"
            placeholder="Bali Summer Escape"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            required
          />

          <AuthTextField
            label="Destination"
            name="destination"
            placeholder="Bali, Indonesia"
            value={formData.destination}
            onChange={(value) => updateField('destination', value)}
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <AuthTextField
              label="Start date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(value) => updateField('startDate', value)}
              required
            />
            <AuthTextField
              label="End date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(value) => updateField('endDate', value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AuthTextField
              label="Travelers"
              name="travelers"
              type="number"
              value={String(formData.travelers)}
              onChange={(value) => updateField('travelers', Number(value))}
              required
            />
            <AuthTextField
              label="Budget"
              name="budget"
              type="number"
              value={String(formData.budget)}
              onChange={(value) => updateField('budget', value)}
              required
            />
          </div>

          <InterestSelector
            id="interests"
            label="Interests"
            options={TRIP_INTEREST_OPTIONS}
            values={formData.interests}
            onChange={(value) => updateField('interests', value)}
          />

          <SelectField
            id="pace"
            label="Pace"
            value={formData.pace}
            onChange={(value) => updateField('pace', value)}
            options={TRIP_PACE_OPTIONS}
          />

          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Any special preferences for this trip..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          <AuthTextField
            label="Destination image URL"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(value) => updateField('imageUrl', value)}
            placeholder="https://images.example.com/bali.jpg"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
            >
              {saving ? 'Saving...' : 'Save Trip'}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}

