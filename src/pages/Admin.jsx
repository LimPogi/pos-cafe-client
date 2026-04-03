import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
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

  // 🔄 FETCH DATA (OPTIMIZED)
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
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/total-sales"),
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/today-sales"),
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/week-sales"),
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/month-sales"),
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/orders"),
        apiFetch("https://pos-cafe-server.onrender.com/api/products/dashboard/daily-sales"),
      ]);

      const totalData = await totalRes.json();
      const todayData = await todayRes.json();
      const weekData = await weekRes.json();
      const monthData = await monthRes.json();
      const ordersData = await ordersRes.json();
      const dailyData = await dailyRes.json();

      setStats({
        totalSales: totalData?.totalSales || 0,
        todaySales: todayData?.todaySales || 0,
        weekSales: weekData?.weekSales || 0,
        monthSales: monthData?.monthSales || 0,
      });

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setDailySales(Array.isArray(dailyData) ? dailyData : []);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧾 SAFE PARSE ITEMS
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
      <hr />
      ${items.map(i => `<p>${i.name} - ₱${i.price}</p>`).join("")}
      <hr />
      <h3>Total: ₱${order.total}</h3>
      <h3>Payment: ₱${order.payment}</h3>
      <h3>Change: ₱${order.change}</h3>
    `);

    win.print();
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
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

      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <Card title="Today Sales" value={stats.todaySales} color="green" />
        <Card title="Week Sales" value={stats.weekSales} color="blue" />
        <Card title="Month Sales" value={stats.monthSales} color="purple" />
        <Card title="Total Sales" value={stats.totalSales} color="black" />

      </div>

      {/* 📈 CHART */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-bold mb-4">📊 Sales Overview</h3>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧾 ORDERS */}
      <h3 className="text-xl font-semibold mb-3">Orders</h3>

      {orders.map((o) => (
        <div
          key={o.id}
          className="bg-white p-4 rounded-xl shadow mb-3"
        >

          <p className="font-bold">Order #{o.id}</p>
          <p>Total: ₱{o.total}</p>
          <p className="text-gray-500 text-sm">
            {new Date(o.created_at).toLocaleString()}
          </p>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSelectedOrder(o)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              View
            </button>

            <button
              onClick={() => printReceipt(o)}
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              Reprint
            </button>
          </div>
        </div>
      ))}

      {/* 🧠 MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h3 className="text-lg font-bold mb-2">Order Details</h3>
            <p>Total: ₱{selectedOrder.total}</p>

            <h4 className="font-bold mt-3 mb-2">Items</h4>

            {parseItems(selectedOrder.items).map((i, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{i.name}</span>
                <span>₱{i.price}</span>
              </div>
            ))}

            <div className="mt-4 flex gap-2">

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>

              <button
                onClick={() => printReceipt(selectedOrder)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Print
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* 🧩 SMALL COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-gray-500">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-600`}>
        ₱{value}
      </p>
    </div>
  );
}

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
  }

  if (user.role !== "admin") {
    navigate("/cashier");
  }
}, []);

export default Dashboard;


