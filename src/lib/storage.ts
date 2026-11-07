/**
 * Petit store typé au-dessus du localStorage, compatible `useSyncExternalStore`.
 * Les mises à jour sont propagées aux composants abonnés et aux autres onglets.
 */

type Listener = () => void

export interface LocalStore<T> {
  get: () => T
  set: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: Listener) => () => void
}

export function createLocalStore<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): LocalStore<T> {
  const listeners = new Set<Listener>()
  let cachedRaw: string | null | undefined
  let cachedValue: T = fallback

  const read = (): T => {
    let raw: string | null = null
    try {
      raw = window.localStorage.getItem(key)
    } catch {
      raw = null
    }
    if (raw === cachedRaw) return cachedValue
    cachedRaw = raw
    try {
      const parsed: unknown = raw === null ? null : JSON.parse(raw)
      cachedValue = validate(parsed) ? parsed : fallback
    } catch {
      cachedValue = fallback
    }
    return cachedValue
  }

  const emit = () => listeners.forEach((l) => l())

  const set: LocalStore<T>["set"] = (next) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(read()) : next
    try {
      if (value === null || value === undefined) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Stockage indisponible (navigation privée, quota) : on garde la valeur en mémoire.
      cachedRaw = JSON.stringify(value)
      cachedValue = value
    }
    emit()
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) emit()
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    if (listeners.size === 1) window.addEventListener("storage", onStorage)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) window.removeEventListener("storage", onStorage)
    }
  }

  return { get: read, set, subscribe }
}
