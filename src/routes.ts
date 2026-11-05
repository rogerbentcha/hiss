/** Chemins de l'application. */
export const ROUTES = {
  welcome: "/",
  max: "/onboarding/max",
  config: "/onboarding/configuration",
  sessions: "/seances",
  session: (n: number) => `/seances/${n}`,
  workout: "/seance-du-jour",
} as const
