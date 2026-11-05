import { useEffect, useState } from "react"

/** Fait progresser une valeur de 0 à 100 par pas réguliers (animation de configuration). */
export function useProgressAnimation(step = 2, intervalMs = 60): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + step)
        if (next >= 100) window.clearInterval(id)
        return next
      })
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [step, intervalMs])

  return progress
}
