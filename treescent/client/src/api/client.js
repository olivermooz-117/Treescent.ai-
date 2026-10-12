const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.msg || "Something went wrong");
  return data;
}

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  updateMe: (body) => request("/api/auth/me", { method: "PATCH", body: JSON.stringify(body) }),

  getLinks: () => request("/api/links"),
  createLink: (body) => request("/api/links", { method: "POST", body: JSON.stringify(body) }),
  updateLink: (id, body) => request(`/api/links/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteLink: (id) => request(`/api/links/${id}`, { method: "DELETE" }),
  reorderLinks: (order) => request("/api/links/reorder", { method: "PUT", body: JSON.stringify({ order }) }),

  getPublicProfile: (username) => request(`/api/public/${username}`),
  getAnalytics: () => request("/api/analytics"),
};

export default api;
