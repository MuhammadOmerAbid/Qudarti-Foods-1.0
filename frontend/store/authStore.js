import { useEffect, useState } from 'react'

const listeners = new Set()

let state = {
  user: null,
}

const setState = (partial) => {
  state = { ...state, ...partial }
  listeners.forEach((listener) => listener(state))
}

export const useAuthStore = () => {
  const [snapshot, setSnapshot] = useState(state)

  useEffect(() => {
    const listener = (nextState) => {
      setSnapshot(nextState)
    }
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  return {
    user: snapshot.user,
    setUser: (user) => setState({ user }),
    clearUser: () => setState({ user: null }),
  }
}
