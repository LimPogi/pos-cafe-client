import { Link } from "react-router-dom";

export default function Sidebar({ role }) {
  return (
    <div className="w-60 h-screen bg-gray-900 text-white p-4">

      <h2 className="text-xl font-bold mb-6">☕ POS System</h2>

      <nav className="flex flex-col gap-3">

        <Link to="/" className="hover:bg-gray-700 p-2 rounded">
          📊 Dashboard
        </Link>

        <Link to="/cashier" className="hover:bg-gray-700 p-2 rounded">
          🧾 Cashier
        </Link>

        {role === "admin" && (
          <Link to="/products" className="hover:bg-gray-700 p-2 rounded">
            📦 Products
          </Link>
        )}

      </nav>

    </div>
  );
}
