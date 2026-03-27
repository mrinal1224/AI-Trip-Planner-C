import { useParams } from 'react-router-dom'
import PageWrapper from '../../components/ui/PageWrapper'
import { useCallback, useEffect, useState } from 'react'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { getTripById, getTripItinerary, replaceTripItinerary } from '../../services/firestore'
import { generateTripItinerary } from '../../services/ai/itineraryGenerator'

function groupBySlot(activities = []) {
  return activities.reduce(
    (acc, item) => {
      const slot = item.slot || 'anytime'
      acc[slot] = acc[slot] || []
      acc[slot].push(item)
      return acc
    },
    { morning: [], afternoon: [], evening: [], anytime: [] },
  )
}

export default function TripDetails() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [itinerary, setItinerary] = useState({ days: [] })
  const [itineraryLoading, setItineraryLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [itineraryError, setItineraryError] = useState('')
  const [itinerarySuccess, setItinerarySuccess] = useState('')

  const loadItinerary = useCallback(async () => {
    if (!tripId) return
    setItineraryLoading(true)
    setItineraryError('')
    try {
      const data = await getTripItinerary(tripId)
      setItinerary(data)
    } catch {
      setItineraryError('Unable to load itinerary right now.')
    } finally {
      setItineraryLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    let mounted = true
    async function loadTrip() {
      if (!tripId) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await getTripById(tripId)
        if (!mounted) return
        setTrip(data)
        await loadItinerary()
      } catch {
        if (!mounted) return
        setError('Unable to load trip details.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadTrip()
    return () => {
      mounted = false
    }
  }, [tripId, loadItinerary])

  async function handleGenerateItinerary() {
    if (!trip || !tripId) return
    setItineraryError('')
    setItinerarySuccess('')
    setGenerating(true)

    try {
      const generated = await generateTripItinerary({
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        interests: trip.interests || [],
        pace: trip.pace || 'Balanced',
        notes: trip.notes || '',
      })

      await replaceTripItinerary(tripId, generated)
      await loadItinerary()
      setItinerarySuccess(
        itinerary.days.length > 0
          ? 'Itinerary regenerated successfully.'
          : 'Itinerary generated successfully.',
      )
    } catch (error) {
      const code = error?.code ? ` (${error.code})` : ''
      setItineraryError(`Could not generate itinerary${code}. Please try again.`)
      console.error('Itinerary generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PageWrapper
      title={`Trip Details`}
      description={tripId ? `Trip ID: ${tripId}` : 'Trip details will appear here.'}
    >
      {loading && <LoadingScreen label="Loading trip details..." />}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && !trip && (
        <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
          Trip not found.
        </div>
      )}
      {!loading && !error && trip && (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{trip.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateItinerary}
                disabled={generating}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
              >
                {generating
                  ? 'Generating...'
                  : itinerary.days.length > 0
                    ? 'Regenerate Itinerary'
                    : 'Generate Itinerary'}
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <p><span className="font-medium">Dates:</span> {trip.startDate} to {trip.endDate}</p>
              <p><span className="font-medium">Travelers:</span> {trip.travelers}</p>
              <p><span className="font-medium">Budget:</span> {trip.budget}</p>
              <p><span className="font-medium">Pace:</span> {trip.pace || 'Balanced'}</p>
              <p><span className="font-medium">Interests:</span> {(trip.interests || []).join(', ') || 'None'}</p>
              <p><span className="font-medium">Share ID:</span> {trip.shareId}</p>
            </div>
            {trip.notes && (
              <div className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-slate-700">
                <span className="font-medium">Notes:</span> {trip.notes}
              </div>
            )}
            {trip.imageUrl && (
              <img
                src={trip.imageUrl}
                alt={trip.destination || 'Destination'}
                className="mt-4 h-48 w-full rounded-lg border border-sky-200 object-cover"
              />
            )}
          </div>

          {itineraryError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {itineraryError}
            </div>
          )}

          {itinerarySuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {itinerarySuccess}
            </div>
          )}

          {itineraryLoading && (
            <div className="rounded-xl border border-sky-200 bg-white p-6">
              <LoadingScreen label="Loading itinerary..." />
            </div>
          )}

          {!itineraryLoading && itinerary.days.length === 0 && (
            <div className="rounded-xl border border-sky-200 bg-white p-6 text-sm text-slate-600">
              No itinerary yet. Click "Generate Itinerary" to create one.
            </div>
          )}

          {!itineraryLoading && itinerary.days.length > 0 && (
            <div className="space-y-3">
              {itinerary.days.map((day) => {
                const grouped = groupBySlot(day.activities || [])
                return (
                  <div
                    key={day.id}
                    className="rounded-xl border border-sky-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">
                        Day {day.dayNumber}: {day.title}
                      </h3>
                      <span className="text-xs font-medium text-slate-500">{day.date}</span>
                    </div>
                    {day.summary && (
                      <p className="mt-1 text-sm text-slate-600">{day.summary}</p>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {['morning', 'afternoon', 'evening'].map((slot) => (
                        <div key={slot} className="rounded-lg bg-sky-50 p-3">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
                            {slot}
                          </div>
                          {(grouped[slot] || []).length === 0 && (
                            <p className="text-xs text-slate-500">No activities</p>
                          )}
                          {(grouped[slot] || []).map((activity) => (
                            <div key={activity.id} className="mb-2">
                              <p className="text-sm font-medium text-slate-800">
                                {activity.title}
                              </p>
                              <p className="text-xs text-slate-600">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  )
}

