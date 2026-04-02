import { Shield, Bell, Activity } from "lucide-react"

export default function Navbar({ alertCount }) {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="text-blue-400" size={24} />
        <span className="text-lg font-semibold text-white">FraudGuard</span>
        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">v1.0</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Activity size={14} className="text-green-400" />
          <span>Live</span>
        </div>
        <div className="relative">
          <Bell size={20} className="text-slate-400" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
