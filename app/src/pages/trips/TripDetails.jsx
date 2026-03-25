import { useParams } from 'react-router-dom'
import PageWrapper from '../../components/ui/PageWrapper'

export default function TripDetails() {
  const { tripId } = useParams()

  return (
    <PageWrapper
      title={`Trip Details`}
      description={tripId ? `Trip ID: ${tripId}` : 'Trip details will appear here.'}
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        Placeholder trip details page. AI itinerary + editing come later.
      </div>
    </PageWrapper>
  )
}

