import FormField from './FormField'

export default function InterestSelector({
  id,
  label,
  options,
  values,
  onChange,
}) {
  function toggleValue(option) {
    const exists = values.includes(option)
    if (exists) {
      onChange(values.filter((item) => item !== option))
      return
    }
    onChange([...values, option])
  }

  return (
    <FormField
      label={label}
      htmlFor={id}
      hint="Pick interests to personalize your itinerary style."
    >
      <div id={id} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleValue(option)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selected
                  ? 'border-blue-700 bg-blue-700 text-white shadow-sm ring-2 ring-blue-200'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-blue-300 hover:bg-sky-50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </FormField>
  )
}

