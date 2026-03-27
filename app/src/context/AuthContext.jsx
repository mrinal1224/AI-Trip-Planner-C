/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase/authService'
import {
  signInWithEmailAndPassword,
  signInWithGooglePopup,
  signOutUser,
  signUpWithEmailAndPassword,
} from '../services/firebase/authService'
import { ensureUserProfileDocument } from '../services/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Persisted sessions are handled by Firebase; we just reflect the state in React.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      try {
        if (firebaseUser?.uid) {
          await ensureUserProfileDocument(firebaseUser)
        }
      } catch (error) {
        console.error('Failed to initialize user profile document:', error)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => {
    return {
      user,
      loading,
      async loginWithEmail(email, password) {
        return signInWithEmailAndPassword(email, password)
      },
      async signupWithEmail(email, password) {
        return signUpWithEmailAndPassword(email, password)
      },
      async loginWithGoogle() {
        return signInWithGooglePopup()
      },
      async logout() {
        return signOutUser()
      },
    }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

