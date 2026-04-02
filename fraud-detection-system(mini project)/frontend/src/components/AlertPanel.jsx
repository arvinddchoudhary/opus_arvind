import { AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export default function AlertPanel({ alerts, onResolve }) {
  return (
    <div className="card">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-orange-400" />
        Active Alerts
        {alerts.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">{alerts.length}</span>
        )}
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {alerts.map((a) => (
          <div key={a.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge-${a.severity}`}>{a.severity.toUpperCase()}</span>
                  <span className="text-slate-400 text-xs">{format(new Date(a.created_at),"HH:mm:ss")}</span>
                </div>
                <p className="text-slate-200 text-sm leading-snug">{a.message}</p>
              </div>
              <button onClick={() => onResolve(a.id)} className="shrink-0 text-green-400 hover:text-green-300 transition-colors" title="Resolve">
                <CheckCircle size={18} />
              </button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-center text-slate-500 py-6 text-sm">No active alerts</p>}
      </div>
    </div>
  )
}
