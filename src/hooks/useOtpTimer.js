import { useState, useEffect, useCallback } from 'react'

export default function useOtpTimer(initialSeconds = 780) {
  const [timer, setTimer] = useState(initialSeconds)

  useEffect(() => {
    if (timer <= 0) return
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const reset = useCallback((seconds) => {
    setTimer(seconds ?? initialSeconds)
  }, [initialSeconds])

  const minutes = String(Math.floor(timer / 60)).padStart(2, '0')
  const seconds = String(timer % 60).padStart(2, '0')

  return { minutes, seconds, timer, reset, expired: timer === 0 }
}
