export default function FormField({ label, htmlFor, required, children, hint }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-brand-600"> *</span>}
        </label>
      )}

      {children}

      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

