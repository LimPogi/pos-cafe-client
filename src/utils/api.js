export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
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
    window.location.reload(); // simple reset
  }

  return res;
};
