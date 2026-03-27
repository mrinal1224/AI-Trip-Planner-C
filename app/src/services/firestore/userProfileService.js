import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { firestore } from '../firebase/firestoreService'

export const PROFILE_INTEREST_OPTIONS = [
  'Culture',
  'History',
  'Beaches',
  'Adventure',
  'Food',
  'Nature',
  'Shopping',
  'Nightlife',
]

export const PROFILE_BUDGET_STYLES = [
  'Budget',
  'Comfort',
  'Luxury',
]

export const PROFILE_TRIP_TYPES = [
  'Solo',
  'Couple',
  'Family',
  'Friends',
  'Work',
]

export const PROFILE_PACES = ['Fast-paced', 'Balanced', 'Relaxed']

export const PROFILE_TRANSPORT_PREFERENCES = [
  'Public Transport',
  'Taxi/Cab',
  'Rental Vehicle',
  'Walking',
  'Mixed',
]

function getUserProfileDocRef(userId) {
  return doc(firestore, 'users', userId)
}

export function getDefaultProfileData(user) {
  return {
    name: user?.displayName || '',
    email: user?.email || '',
    budgetStyle: 'Comfort',
    tripType: 'Solo',
    interests: [],
    pace: 'Balanced',
    transportPreference: 'Mixed',
  }
}

export async function ensureUserProfileDocument(user) {
  if (!user?.uid) return

  const profileRef = getUserProfileDocRef(user.uid)
  const snapshot = await getDoc(profileRef)

  if (snapshot.exists()) {
    return snapshot.data()
  }

  const initialProfile = getDefaultProfileData(user)

  await setDoc(profileRef, {
    ...initialProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return initialProfile
}

export async function getUserProfile(userId) {
  const profileRef = getUserProfileDocRef(userId)
  const snapshot = await getDoc(profileRef)

  if (!snapshot.exists()) return null
  return snapshot.data()
}

export async function updateUserProfile(userId, data) {
  const profileRef = getUserProfileDocRef(userId)
  await updateDoc(profileRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

