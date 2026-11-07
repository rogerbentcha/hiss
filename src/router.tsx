import { createBrowserRouter } from "react-router"

import { ExerciseLayout, LegacyRedirect } from "@/components/layout/exercise-layout"
import { RootLayout } from "@/components/layout/root-layout"
import { ConfigPage } from "@/pages/config-page"
import { HomePage } from "@/pages/home-page"
import { MaxPage } from "@/pages/max-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { SessionDetailPage } from "@/pages/session-detail-page"
import { SessionsPage } from "@/pages/sessions-page"
import { WelcomePage } from "@/pages/welcome-page"
import { WorkoutPage } from "@/pages/workout-page"
import { HOME } from "@/routes"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: HOME, element: <HomePage /> },
      // Chemins relatifs : ils doivent rester alignés sur `exerciseRoutes` (src/routes.ts).
      {
        path: ":exercise",
        element: <ExerciseLayout />,
        children: [
          { index: true, element: <WelcomePage /> },
          { path: "onboarding/max", element: <MaxPage /> },
          { path: "onboarding/configuration", element: <ConfigPage /> },
          { path: "seances", element: <SessionsPage /> },
          { path: "seances/:numero", element: <SessionDetailPage /> },
          { path: "seance-du-jour", element: <WorkoutPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      { path: "onboarding/*", element: <LegacyRedirect /> },
      { path: "seances/*", element: <LegacyRedirect /> },
      { path: "seance-du-jour", element: <LegacyRedirect /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
