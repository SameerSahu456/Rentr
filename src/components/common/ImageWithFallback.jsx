import { useState, useCallback } from 'react'
import { FALLBACK_IMAGE } from '../../constants/images'

/**
 * Drop-in replacement for <img> with automatic fallback on error.
 * Retries the original src once before falling back.
 */
export default function ImageWithFallback({
  src,
  fallback = FALLBACK_IMAGE,
  alt = '',
  ...props
}) {
  const [retries, setRetries] = useState(0)

  const handleError = useCallback(
    (e) => {
      if (retries === 0) {
        // First failure — retry original src once
        setRetries(1)
        e.target.src = src
      } else {
        // Second failure — use fallback
        e.target.src = fallback
      }
    },
    [src, fallback, retries],
  )

  return (
    <img
      src={src || fallback}
      alt={alt}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  )
}
