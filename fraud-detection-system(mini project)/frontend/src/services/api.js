import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001"

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

export const transactionAPI = {
  getAll:  (params = {}) => api.get("/transactions/", { params }),
  getById: (id)           => api.get(`/transactions/${id}`),
  create:  (data)         => api.post("/transactions/", data),
}

export const alertAPI = {
  getAll:  (params = {}) => api.get("/alerts/", { params }),
  resolve: (id, by = "analyst") => api.patch(`/alerts/${id}/resolve`, { resolved_by: by }),
}

export const analyticsAPI = {
  getSummary: () => api.get("/analytics/summary"),
}

export default api
