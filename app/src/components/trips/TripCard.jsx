import { Link } from 'react-router-dom'

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Dates not set'
  return `${startDate} to ${endDate}`
}

export default function TripCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block rounded-xl border border-sky-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{trip.title}</h3>
          <p className="text-sm text-slate-600">{trip.destination}</p>
        </div>
        <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
          {trip.pace || 'Balanced'}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p>
          <span className="font-medium">Dates:</span> {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        <p>
          <span className="font-medium">Budget:</span> {trip.budget}
        </p>
      </div>
    </Link>
  )
}

