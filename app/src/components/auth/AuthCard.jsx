export default function AuthCard({ title, description, children }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
      <div className="mb-5">
        {title && (
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
        )}
        {description && (
          <p className="mt-1 text-sm text-slate-600">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

