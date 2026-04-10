import { Outlet } from "react-router-dom"
import { CareerProvider } from "./context/CareerContext"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <CareerProvider>
      <div className="app-shell">
        <div className="ambient-grid" aria-hidden="true" />

        <Navbar />

        <main
          id="main-content"
          className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </CareerProvider>
  )
}
