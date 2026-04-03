import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Cashier from "./pages/Cashier";
import Products from "./pages/Products";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔐 LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 🧑‍💼 ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* 🧾 CASHIER ROUTE */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["admin", "cashier"]}>
              <Cashier />
            </ProtectedRoute>
          }
        />

        {/* 📦 PRODUCTS (ADMIN ONLY) */}
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Products />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
