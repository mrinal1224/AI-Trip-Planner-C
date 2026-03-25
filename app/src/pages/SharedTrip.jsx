import { useParams } from 'react-router-dom'
import PageWrapper from '../components/ui/PageWrapper'

export default function SharedTrip() {
  const { shareId } = useParams()

  return (
    <PageWrapper
      title="Shared Trip"
      description={shareId ? `Share ID: ${shareId}` : 'Shared trip will appear here.'}
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        Placeholder shared trip page. Collaboration/sharing comes later.
      </div>
    </PageWrapper>
  )
}

