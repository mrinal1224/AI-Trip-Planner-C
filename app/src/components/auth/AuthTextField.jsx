export default function AuthTextField({
  label,
  type = 'text',
  value,
  onChange,
  name,
  autoComplete,
  placeholder,
  error,
  required,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-brand-600"> *</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm outline-none',
          'bg-white text-slate-900',
          'border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
        ].join(' ')}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

