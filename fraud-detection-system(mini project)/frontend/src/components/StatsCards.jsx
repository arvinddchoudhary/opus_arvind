import { DollarSign, AlertTriangle, TrendingUp, Shield } from "lucide-react"

export default function StatsCards({ stats }) {
  const cards = [
    { label:"Total Transactions", value: stats?.total_transactions?.toLocaleString() ?? "—", icon: TrendingUp,     color:"text-blue-400",   bg:"bg-blue-900/30"   },
    { label:"Fraud Detected",     value: stats?.total_fraud?.toLocaleString()         ?? "—", icon: AlertTriangle, color:"text-red-400",    bg:"bg-red-900/30"    },
    { label:"Fraud Rate",         value: stats ? `${stats.fraud_rate}%`               : "—",  icon: Shield,        color:"text-orange-400", bg:"bg-orange-900/30" },
    { label:"Total Volume",       value: stats ? `$${(stats.total_amount/1000).toFixed(1)}K` : "—", icon: DollarSign, color:"text-green-400", bg:"bg-green-900/30" },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card flex items-center gap-4">
          <div className={`${c.bg} p-3 rounded-lg`}><c.icon className={c.color} size={20} /></div>
          <div>
            <p className="text-slate-400 text-xs">{c.label}</p>
            <p className="text-white text-xl font-bold">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
