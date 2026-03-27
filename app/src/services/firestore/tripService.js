import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { firestore } from '../firebase/firestoreService'

export const TRIP_PACE_OPTIONS = ['Fast-paced', 'Balanced', 'Relaxed']
export const TRIP_INTEREST_OPTIONS = [
  'Culture',
  'History',
  'Beaches',
  'Adventure',
  'Food',
  'Nature',
  'Shopping',
  'Nightlife',
]

function generateShareId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  return Math.random().toString(36).slice(2, 14)
}

export async function createTrip({
  userId,
  title,
  destination,
  startDate,
  endDate,
  travelers,
  budget,
  interests,
  pace,
  notes,
  imageUrl,
}) {
  const payload = {
    userId,
    title,
    destination,
    startDate,
    endDate,
    travelers: Number(travelers),
    budget: Number(budget),
    interests: interests || [],
    pace: pace || 'Balanced',
    notes: notes || '',
    imageUrl: imageUrl || '',
    shareId: generateShareId(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(firestore, 'trips'), payload)
  return docRef.id
}

export async function getUserTrips(userId) {
  const tripsRef = collection(firestore, 'trips')
  const orderedQuery = query(
    tripsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  function mapTrips(snapshot) {
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
  }

  try {
    const snapshot = await getDocs(orderedQuery)
    return mapTrips(snapshot)
  } catch (error) {
    // Fallback for missing composite index (failed-precondition).
    if (error?.code === 'failed-precondition') {
      const fallbackQuery = query(tripsRef, where('userId', '==', userId))
      const fallbackSnapshot = await getDocs(fallbackQuery)
      const trips = mapTrips(fallbackSnapshot)
      return trips.sort((a, b) => {
        const aMs = a?.createdAt?.toMillis?.() || 0
        const bMs = b?.createdAt?.toMillis?.() || 0
        return bMs - aMs
      })
    }

    throw error
  }
}

export async function getTripById(tripId) {
  const tripRef = doc(firestore, 'trips', tripId)
  const snapshot = await getDoc(tripRef)
  if (!snapshot.exists()) return null

  return { id: snapshot.id, ...snapshot.data() }
}

