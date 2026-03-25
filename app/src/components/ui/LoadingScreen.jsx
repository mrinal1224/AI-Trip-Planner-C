export default function LoadingScreen({ label }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 px-4 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
      {label && <p className="text-sm text-slate-600">{label}</p>}
    </div>
  )
}

