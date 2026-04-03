import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/layout/Loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    console.log("🚀 Sending login request...");
    setLoading(true);

    const res = await fetch(
      "https://pos-cafe-server.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    console.log("STATUS:", res.status);

    const data = await res.json();

    console.log("RESPONSE:", data);

    if (data.token && data.user) {
      // ✅ SAVE SESSION
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔥 ROLE ROUTING (UPDATED)
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cashier");
      }

    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error("FRONTEND ERROR:", err);
    alert("Server error");
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
