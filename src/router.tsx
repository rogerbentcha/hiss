import { createBrowserRouter } from "react-router"

import { RootLayout } from "@/components/layout/root-layout"
import { ConfigPage } from "@/pages/config-page"
import { MaxPage } from "@/pages/max-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { SessionDetailPage } from "@/pages/session-detail-page"
import { SessionsPage } from "@/pages/sessions-page"
import { WelcomePage } from "@/pages/welcome-page"
import { WorkoutPage } from "@/pages/workout-page"
import { ROUTES } from "@/routes"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.welcome, element: <WelcomePage /> },
      { path: ROUTES.max, element: <MaxPage /> },
      { path: ROUTES.config, element: <ConfigPage /> },
      { path: ROUTES.sessions, element: <SessionsPage /> },
      { path: `${ROUTES.sessions}/:numero`, element: <SessionDetailPage /> },
      { path: ROUTES.workout, element: <WorkoutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
