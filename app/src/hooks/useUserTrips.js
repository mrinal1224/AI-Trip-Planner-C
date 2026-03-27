import { useCallback, useEffect, useState } from 'react'
import { getUserTrips } from '../services/firestore'

export default function useUserTrips(userId) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTrips = useCallback(async () => {
    if (!userId) {
      setTrips([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getUserTrips(userId)
      setTrips(data)
    } catch (error) {
      const code = error?.code ? ` (${error.code})` : ''
      setError(`Unable to load trips right now${code}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return {
    trips,
    loading,
    error,
    refetch: fetchTrips,
  }
}

