import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const API = import.meta.env.VITE_API_URL;

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
  });

  const [orders, setOrders] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/cashier");
  }, []);

  // 📦 FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        totalRes,
        todayRes,
        weekRes,
        monthRes,
        ordersRes,
        dailyRes
      ] = await Promise.all([
        axios.get(`${API}/products/dashboard/total-sales`),
        axios.get(`${API}/products/dashboard/today-sales`),
        axios.get(`${API}/products/dashboard/week-sales`),
        axios.get(`${API}/products/dashboard/month-sales`),
        axios.get(`${API}/products/dashboard/orders`),
        axios.get(`${API}/products/dashboard/daily-sales`),
      ]);

      setStats({
        totalSales: totalRes.data?.totalSales || 0,
        todaySales: todayRes.data?.todaySales || 0,
        weekSales: weekRes.data?.weekSales || 0,
        monthSales: monthRes.data?.monthSales || 0,
      });

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setDailySales(Array.isArray(dailyRes.data) ? dailyRes.data : []);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧾 PARSE ITEMS
  const parseItems = (items) => {
    try {
      return Array.isArray(items) ? items : JSON.parse(items || "[]");
    } catch {
      return [];
    }
  };

  // 🧾 PRINT RECEIPT
  const printReceipt = (order) => {
    const win = window.open("", "", "width=400,height=600");
    const items = parseItems(order.items);

    win.document.write(`
      <h2>RECEIPT</h2>
      <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
      <hr/>
      ${items.map(i => `<p>${i.name} - ₱${i.price}</p>`).join("")}
      <hr/>
      <h3>Total: ₱${order.total}</h3>
      <h3>Payment: ₱${order.payment}</h3>
      <h3>Change: ₱${order.change}</h3>
    `);

    win.print();
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>

      <button
        onClick={fetchData}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        🔄 Refresh
      </button>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card title="Today Sales" value={stats.todaySales} />
        <Card title="Week Sales" value={stats.weekSales} />
        <Card title="Month Sales" value={stats.monthSales} />
        <Card title="Total Sales" value={stats.totalSales} />
      </div>

      {/* CHART */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ORDERS */}
      {orders.map((o) => (
        <div key={o.id} className="bg-white p-4 rounded-xl shadow mb-3">
          <p className="font-bold">Order #{o.id}</p>
          <p>Total: ₱{o.total}</p>

          <button onClick={() => setSelectedOrder(o)}>
            View
          </button>

          <button onClick={() => printReceipt(o)}>
            Reprint
          </button>
        </div>
      ))}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h3>Order Details</h3>
            <p>Total: ₱{selectedOrder.total}</p>

            <button onClick={() => setSelectedOrder(null)}>
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

// 🧩 CARD COMPONENT
function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">₱{value}</p>
    </div>
  );
}

export default Dashboard;
