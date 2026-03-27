import PageWrapper from '../../components/ui/PageWrapper'
import { Link } from 'react-router-dom'
import LoadingScreen from '../../components/ui/LoadingScreen'
import TripCard from '../../components/trips/TripCard'
import { useAuth } from '../../context/AuthContext'
import useUserTrips from '../../hooks/useUserTrips'

export default function Dashboard() {
  const { user } = useAuth()
  const { trips, loading, error } = useUserTrips(user?.uid)

  return (
    <PageWrapper
      title="Dashboard"
      description="View and manage all your trips in one place."
    >
      <div className="mb-4 flex items-center justify-end">
        <Link
          to="/create-trip"
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Create New Trip
        </Link>
      </div>

      {loading && <LoadingScreen label="Loading your trips..." />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="rounded-xl border border-sky-200 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No trips yet</h3>
          <p className="mt-1 text-sm text-slate-600">
            Create your first trip and start planning.
          </p>
          <Link
            to="/create-trip"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Create New Trip
          </Link>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

