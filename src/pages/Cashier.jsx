import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function Cashier() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState("");

  // 📦 FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("http://localhost:5001/api/products");
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ ADD TO CART
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // ❌ REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // 💰 CALCULATIONS
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discount = subtotal > 1000 ? subtotal * 0.1 : 0; // 10% discount rule
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.12; // 12% VAT

  const total = taxableAmount + tax;

  // 💳 CHECKOUT
  const checkout = async () => {
    if (!cart.length) return alert("Cart is empty");
    if (!payment) return alert("Enter payment");

    // 🧾 ORDER DATA (FINAL STRUCTURE)
    const orderData = {
      items: cart,
      subtotal,
      discount,
      tax,
      total,
      payment: Number(payment),
      change: Number(payment) - total,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success || data.id) {
        alert("Order completed!");

        setCart([]);
        setPayment("");
      } else {
        alert("Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">

      {/* 🧃 PRODUCTS */}
      <div className="w-2/3 p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">🧃 Products</h2>

        <div className="grid grid-cols-3 gap-4">

          {products.map((p) => (
            <div
              key={p.id}
              className="card p-4 cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition"
              onClick={() => addToCart(p)}
            >
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-green-600">₱{p.price}</p>
            </div>
          ))}

        </div>
      </div>

      {/* 🛒 CART */}
      <div className="w-1/3 bg-white p-4 shadow-lg flex flex-col">

        <h2 className="text-xl font-bold mb-4">🛒 Cart</h2>

        <div className="flex-1 overflow-auto">

          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between mb-2 border-b pb-2"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ₱{item.price} x {item.qty}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500"
              >
                ❌
              </button>
            </div>
          ))}

        </div>

        {/* 💰 TOTAL + PAYMENT */}
        <div className="border-t pt-3">

          <h3 className="text-lg font-bold">
            Subtotal: ₱{subtotal}
          </h3>

          <h3 className="text-sm">
            Discount: ₱{discount}
          </h3>

          <h3 className="text-sm">
            Tax (12%): ₱{tax.toFixed(2)}
          </h3>

          <h3 className="text-lg font-bold mt-2">
            Total: ₱{total.toFixed(2)}
          </h3>

          <input
            type="number"
            placeholder="Payment"
            className="w-full border p-2 rounded mt-2"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          />

          <p className="mt-1">
            Change: ₱{payment ? (Number(payment) - total).toFixed(2) : 0}
          </p>

          <button
            onClick={checkout}
            className="w-full bg-green-600 text-white p-2 rounded mt-3"
          >
            Checkout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Cashier;
