import { useState, useEffect, useCallback } from "react"
import StatsCards from "./StatsCards"
import TransactionTable from "./TransactionTable"
import AlertPanel from "./AlertPanel"
import TransactionForm from "./TransactionForm"
import { transactionAPI, alertAPI, analyticsAPI } from "../services/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Plus } from "lucide-react"

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [alerts, setAlerts]             = useState([])
  const [stats, setStats]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [fraudFilter, setFraudFilter]   = useState(false)
  const [showForm, setShowForm]         = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [txnRes, alertRes, statsRes] = await Promise.all([
        transactionAPI.getAll({ fraud_only: fraudFilter, limit: 50 }),
        alertAPI.getAll({ unresolved_only: true }),
        analyticsAPI.getSummary(),
      ])
      setTransactions(txnRes.data)
      setAlerts(alertRes.data)
      setStats(statsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [fraudFilter])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 10000)
    return () => clearInterval(id)
  }, [fetchAll])

  const resolveAlert = async (alertId) => {
    await alertAPI.resolve(alertId)
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const riskData = [
    { name:"Low",      value: transactions.filter(t=>(t.fraud_score??0)<0.5).length,                               fill:"#22c55e" },
    { name:"Medium",   value: transactions.filter(t=>(t.fraud_score??0)>=0.5&&(t.fraud_score??0)<0.7).length,     fill:"#f59e0b" },
    { name:"High",     value: transactions.filter(t=>(t.fraud_score??0)>=0.7&&(t.fraud_score??0)<0.8).length,     fill:"#f97316" },
    { name:"Critical", value: transactions.filter(t=>(t.fraud_score??0)>=0.8).length,                             fill:"#ef4444" },
  ]

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">

      {/* Submit Transaction Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Submit Transaction
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Filter:</span>
            {[{label:"All",v:false},{label:"Fraud Only",v:true}].map(({label,v}) => (
              <button key={label} onClick={() => setFraudFilter(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  fraudFilter===v ? (v?"bg-red-600":"bg-blue-600")+" text-white" : "bg-slate-700 text-slate-400"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <TransactionTable transactions={transactions} loading={loading} />
        </div>

        <div className="space-y-6">
          <AlertPanel alerts={alerts} onResolve={resolveAlert} />
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={riskData}>
                <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} />
                <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} />
                <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:8}} labelStyle={{color:"#e2e8f0"}} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {riskData.map((d,i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSubmitted={() => { fetchAll(); }}
        />
      )}
    </div>
  )
}
