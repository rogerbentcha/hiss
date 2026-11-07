import { RotateCcw } from "lucide-react"
import { useNavigate } from "react-router"

import { EXERCISES } from "@/lib/exercises"
import { EMPTY_STATE, getStores } from "@/lib/stores"
import { HOME } from "@/routes"

/**
 * Outil de développement : efface les données stockées de tous les exercices (programme, historique,
 * séance en cours) et revient à l'accueil. Rendu uniquement en dev (`import.meta.env.DEV`).
 */
export function DevResetButton() {
  const navigate = useNavigate()

  const reset = () => {
    // Via les stores, pour que les composants abonnés se mettent à jour sans recharger.
    EXERCISES.forEach((e) => {
      const stores = getStores(e.id)
      stores.program.set(EMPTY_STATE)
      stores.workout.set(null)
      // Puis on supprime vraiment les clés : les stores retombent sur les mêmes valeurs par défaut.
      Object.values(e.storageKeys).forEach((key) => window.localStorage.removeItem(key))
    })
    navigate(HOME, { replace: true })
  }

  return (
    <button
      type="button"
      onClick={reset}
      title="Dev : effacer les données et revenir à l'accueil"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-50 flex items-center gap-1.5 rounded-full border border-dashed border-surface-3 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground opacity-60 shadow-sm backdrop-blur transition-opacity hover:opacity-100 focus-visible:opacity-100"
    >
      <RotateCcw className="size-3.5" aria-hidden />
      Reset
    </button>
  )
}
