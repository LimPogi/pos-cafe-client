export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const API = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔐 AUTO LOGOUT ON 401
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    alert("Session expired. Please login again.");
    window.location.reload();
  }

  return res;
};