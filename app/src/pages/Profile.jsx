import PageWrapper from '../components/ui/PageWrapper'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : null) || 'Traveler'
  const avatarUrl = user?.photoURL || null
  const avatarFallback = displayName.slice(0, 1).toUpperCase()

  return (
    <PageWrapper
      title="Profile"
      description="Account-related settings will go here."
    >
      <div className="rounded-xl border border-sky-200 bg-white p-6 text-slate-700">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-12 w-12 rounded-full border border-sky-200 object-cover"
            />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-xl font-semibold text-sky-800">
              {avatarFallback}
            </span>
          )}

          <div>
            <div className="text-lg font-semibold text-slate-900">{displayName}</div>
            {user?.email && (
              <div className="text-sm text-slate-500">{user.email}</div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-sky-50 p-4 text-sm text-slate-600">
          Placeholder profile page. No business logic yet.
        </div>
      </div>
    </PageWrapper>
  )
}

