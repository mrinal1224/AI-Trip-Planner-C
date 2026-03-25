import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { firebaseApp } from './firebaseApp'

export const auth = getAuth(firebaseApp)

const googleProvider = new GoogleAuthProvider()

export function signUpWithEmailAndPassword(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signInWithEmailAndPassword(email, password) {
  return firebaseSignInWithEmailAndPassword(auth, email, password)
}

export function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider)
}

export function signOutUser() {
  return signOut(auth)
}

export function getFriendlyAuthError(error) {
  const code = error?.code || ''

  // Common Firebase Auth error codes.
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
      return 'No account found with that email. Try signing up instead.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try logging in.'
    case 'auth/weak-password':
      return 'Your password is too weak. Use at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completing. Please try again.'
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. Please try again.'
    default:
      return error?.message || 'Something went wrong. Please try again.'
  }
}

