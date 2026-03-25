import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick, hideMenu }) {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const displayName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Traveler'

  const avatarUrl = user?.photoURL || null
  const avatarFallback = displayName.slice(0, 1).toUpperCase()

  async function handleLogout() {
    try {
      setLoggingOut(true)
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          {!hideMenu && (
            <button
              type="button"
              aria-label="Open sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-white text-slate-900 hover:bg-sky-50"
              onClick={onMenuClick}
            >
              <span className="block h-0 w-0 overflow-hidden">Menu</span>
              <div className="space-y-1">
                <div className="h-0.5 w-5 bg-sky-700" />
                <div className="h-0.5 w-5 bg-sky-700" />
                <div className="h-0.5 w-5 bg-sky-700" />
              </div>
            </button>
          )}

          <NavLink
            to="/dashboard"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            AI Travel Planner
          </NavLink>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          {!hideMenu && (
            <NavLink
              to="/profile"
              className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-7 w-7 rounded-full border border-sky-200 object-cover"
                />
              ) : (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sm font-semibold text-sky-800">
                  {avatarFallback}
                </span>
              )}

              <span className="max-w-[140px] truncate sm:inline">{displayName}</span>
            </NavLink>
          )}

          {user && !hideMenu && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

