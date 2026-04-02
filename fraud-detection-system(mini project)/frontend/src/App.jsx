import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import { alertAPI } from "./services/api"

export default function App() {
  const [alertCount, setAlertCount] = useState(0)
  useEffect(() => {
    const fetch = async () => {
      try { const res = await alertAPI.getAll({unresolved_only:true}); setAlertCount(res.data.length) } catch(_){}
    }
    fetch()
    const id = setInterval(fetch, 15000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar alertCount={alertCount} />
      <Dashboard />
    </div>
  )
}
