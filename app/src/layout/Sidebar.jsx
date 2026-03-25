import { NavLink } from 'react-router-dom'

export default function Sidebar({ items, variant, isOpen, onClose }) {
  const isMobile = variant === 'mobile'

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          Navigation
        </div>
      </div>

      <ul className="space-y-1 px-2 pb-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                isActive
                  ? 'block rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white'
                  : 'block rounded-lg px-3 py-2 text-sm font-medium text-sky-900/80 hover:bg-sky-50'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )

  if (!isMobile) {
    return (
      <div className="h-dvh w-64 border-r border-sky-200 bg-white">
        {sidebarContent}
      </div>
    )
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-0 z-50 h-dvh w-72 transform border-r border-sky-200 bg-white shadow-xl transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}

