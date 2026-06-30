import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("healbit_auth");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore malformed storage */
    }
  }
  return config;
});

// If the token is rejected, clear the stale session.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("healbit_auth");
    }
    return Promise.reject(err);
  }
);

export default api;
