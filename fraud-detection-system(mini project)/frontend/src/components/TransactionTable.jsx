import { format } from "date-fns"

const riskBadge = (score) => {
  if (score >= 0.8) return <span className="badge-critical">Critical</span>
  if (score >= 0.7) return <span className="badge-high">High</span>
  if (score >= 0.5) return <span className="badge-medium">Medium</span>
  return <span className="badge-low">Low</span>
}

export default function TransactionTable({ transactions, loading }) {
  if (loading) return (
    <div className="card animate-pulse space-y-3">
      {[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-slate-700 rounded" />)}
    </div>
  )
  return (
    <div className="card overflow-x-auto">
      <h2 className="text-white font-semibold mb-4">Recent Transactions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            {["ID","Amount","Merchant","Score","Risk","Status","Time"].map(h => (
              <th key={h} className="pb-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="py-3 font-mono text-slate-300 text-xs">{t.transaction_id.slice(0,8)}...</td>
              <td className="py-3 text-white font-semibold">${Number(t.amount).toLocaleString("en",{minimumFractionDigits:2})}</td>
              <td className="py-3 text-slate-300">{t.merchant_name ?? "—"}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                    <div className={`h-full rounded-full ${t.fraud_score>=0.8?"bg-red-500":t.fraud_score>=0.5?"bg-orange-500":"bg-green-500"}`}
                         style={{width:`${(t.fraud_score??0)*100}%`}} />
                  </div>
                  <span className="text-slate-400 text-xs">{((t.fraud_score??0)*100).toFixed(0)}%</span>
                </div>
              </td>
              <td className="py-3">{riskBadge(t.fraud_score??0)}</td>
              <td className="py-3"><span className={t.is_fraud?"badge-fraud":"badge-approved"}>{t.status}</span></td>
              <td className="py-3 text-slate-400 text-xs">{format(new Date(t.created_at),"MMM d, HH:mm")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && <p className="text-center text-slate-500 py-8">No transactions yet</p>}
    </div>
  )
}
