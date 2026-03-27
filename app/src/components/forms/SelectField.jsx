import FormField from './FormField'

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  hint,
}) {
  return (
    <FormField label={label} htmlFor={id} required={required} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-2 border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="mt-2">
        <span className="inline-flex items-center rounded-full bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white">
          Selected: {value}
        </span>
      </div>
    </FormField>
  )
}

