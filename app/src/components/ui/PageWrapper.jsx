export default function PageWrapper({ title, description, children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  )
}

