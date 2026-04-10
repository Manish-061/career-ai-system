import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import App from "./App"

// Lazy-load pages for code splitting
const Home = lazy(() => import("./pages/Home/Home"))
const Assess = lazy(() => import("./pages/Assess/Assess"))
const Results = lazy(() => import("./pages/Results/Results"))
const GenerationStudio = lazy(() => import("./pages/GenerationStudio/GenerationStudio"))

// Simple suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="loader-spinner" aria-label="Loading page" />
    </div>
  )
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <Home />
          </LazyPage>
        ),
      },
      {
        path: "assess",
        element: (
          <LazyPage>
            <Assess />
          </LazyPage>
        ),
      },
      {
        path: "result",
        element: (
          <LazyPage>
            <Results />
          </LazyPage>
        ),
      },
      {
        path: "generate",
        element: (
          <LazyPage>
            <GenerationStudio />
          </LazyPage>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
