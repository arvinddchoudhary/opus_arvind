import { useState } from "react"
import { transactionAPI } from "../services/api"
import { X, Send } from "lucide-react"

const CATEGORIES = ["grocery","gas_station","restaurant","retail","online","travel","entertainment","healthcare","atm","other"]

export default function TransactionForm({ onClose, onSubmitted }) {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [form, setForm] = useState({
    transaction_id:      `TXN_${Date.now()}`,
    user_id:             "",
    amount:              "",
    merchant_name:       "",
    merchant_category:   "grocery",
    hour_of_day:         new Date().getHours(),
    day_of_week:         new Date().getDay(),
    is_weekend:          [0,6].includes(new Date().getDay()),
    distance_from_home:  "",
  })

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.user_id || !form.amount) return alert("User ID and Amount are required")
    setLoading(true)
    try {
      const res = await transactionAPI.create({
        ...form,
        amount:             parseFloat(form.amount),
        hour_of_day:        parseInt(form.hour_of_day),
        day_of_week:        parseInt(form.day_of_week),
        distance_from_home: parseFloat(form.distance_from_home) || 0,
      })
      setResult(res.data)
      onSubmitted()
    } catch(e) {
      alert("Error submitting transaction: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}}>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Submit Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Result */}
        {result ? (
          <div className={`rounded-xl p-5 mb-4 border ${result.is_fraud ? "bg-red-900/40 border-red-700" : "bg-green-900/40 border-green-700"}`}>
            <p className="text-white font-bold text-xl mb-1">
              {result.is_fraud ? "?? FRAUD DETECTED" : "? TRANSACTION APPROVED"}
            </p>
            <p className="text-slate-300 text-sm">Fraud Score: <span className="font-bold text-white">{((result.fraud_score || 0) * 100).toFixed(0)}%</span></p>
            <p className="text-slate-300 text-sm">Status: <span className="font-bold text-white">{result.status}</span></p>
            {result.fraud_reason && (
              <p className="text-slate-400 text-xs mt-2">{result.fraud_reason}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setResult(null); setForm(p => ({...p, transaction_id:`TXN_${Date.now()}`, user_id:"", amount:"", merchant_name:"", distance_from_home:""})) }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm">
                Submit Another
              </button>
              <button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">User ID *</label>
                <input
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="USER_001"
                  value={form.user_id}
                  onChange={e => handle("user_id", e.target.value)}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Amount ($) *</label>
                <input
                  type="number"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="150.00"
                  value={form.amount}
                  onChange={e => handle("amount", e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Merchant Name</label>
                <input
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Starbucks"
                  value={form.merchant_name}
                  onChange={e => handle("merchant_name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Category</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={form.merchant_category}
                  onChange={e => handle("merchant_category", e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Hour of Day (0-23)</label>
                <input
                  type="number" min="0" max="23"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={form.hour_of_day}
                  onChange={e => handle("hour_of_day", e.target.value)}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Distance from Home (km)</label>
                <input
                  type="number"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="10"
                  value={form.distance_from_home}
                  onChange={e => handle("distance_from_home", e.target.value)}
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center gap-3">
              <label className="text-slate-400 text-sm">Weekend transaction?</label>
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                checked={form.is_weekend}
                onChange={e => handle("is_weekend", e.target.checked)}
              />
              <span className="text-slate-300 text-sm">{form.is_weekend ? "Yes" : "No"}</span>
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
              ) : (
                <><Send size={16} /> Check for Fraud</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
