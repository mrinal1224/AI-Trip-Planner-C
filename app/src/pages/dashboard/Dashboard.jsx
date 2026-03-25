import PageWrapper from '../../components/ui/PageWrapper'

export default function Dashboard() {
  return (
    <PageWrapper
      title="Dashboard"
      description="Your trips will appear here."
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        Placeholder dashboard. Trip list + actions come in later features.
      </div>
    </PageWrapper>
  )
}

