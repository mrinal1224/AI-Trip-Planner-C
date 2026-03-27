import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { firestore } from '../firebase/firestoreService'

function getDayDocId(dayNumber) {
  return `day-${String(dayNumber).padStart(2, '0')}`
}

function getActivityDocId(slot, index) {
  return `${slot}-${index + 1}`
}

async function deleteExistingItinerary(tripId) {
  const daysRef = collection(firestore, 'trips', tripId, 'itineraryDays')
  const daySnapshots = await getDocs(daysRef)

  for (const dayDoc of daySnapshots.docs) {
    const activitiesRef = collection(
      firestore,
      'trips',
      tripId,
      'itineraryDays',
      dayDoc.id,
      'activities',
    )
    const activitySnapshots = await getDocs(activitiesRef)
    for (const activityDoc of activitySnapshots.docs) {
      await deleteDoc(activityDoc.ref)
    }
    await deleteDoc(dayDoc.ref)
  }
}

export async function replaceTripItinerary(tripId, itinerary) {
  await deleteExistingItinerary(tripId)

  for (const day of itinerary.days || []) {
    const dayId = getDayDocId(day.dayNumber)
    const dayRef = doc(firestore, 'trips', tripId, 'itineraryDays', dayId)

    await setDoc(dayRef, {
      dayNumber: day.dayNumber,
      date: day.date,
      title: day.title,
      summary: day.summary,
      updatedAt: serverTimestamp(),
    })

    for (const [index, activity] of (day.activities || []).entries()) {
      const activityId = getActivityDocId(activity.slot || 'activity', index)
      const activityRef = doc(
        firestore,
        'trips',
        tripId,
        'itineraryDays',
        dayId,
        'activities',
        activityId,
      )
      await setDoc(activityRef, {
        slot: activity.slot || 'anytime',
        title: activity.title,
        description: activity.description,
        order: index,
        updatedAt: serverTimestamp(),
      })
    }
  }

  const tripRef = doc(firestore, 'trips', tripId)
  await updateDoc(tripRef, {
    itineraryGeneratedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getTripItinerary(tripId) {
  const daysRef = collection(firestore, 'trips', tripId, 'itineraryDays')
  const daysQuery = query(daysRef, orderBy('dayNumber', 'asc'))
  const daySnapshots = await getDocs(daysQuery)

  const days = await Promise.all(
    daySnapshots.docs.map(async (dayDoc) => {
      const activitiesRef = collection(
        firestore,
        'trips',
        tripId,
        'itineraryDays',
        dayDoc.id,
        'activities',
      )
      const activitiesQuery = query(activitiesRef, orderBy('order', 'asc'))
      const activitySnapshots = await getDocs(activitiesQuery)

      return {
        id: dayDoc.id,
        ...dayDoc.data(),
        activities: activitySnapshots.docs.map((activityDoc) => ({
          id: activityDoc.id,
          ...activityDoc.data(),
        })),
      }
    }),
  )

  return { days }
}

