import { useEffect, useState } from "react";
import axios from "axios";

export default function Cashier() {
  const API = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true);

  // 📦 FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data || []);
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
    const exists = cart.find((item) => item.id === product.id);

    if (exists) {
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

  // ➖ REMOVE ITEM
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // 💰 COMPUTATIONS
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discount = 0; // you can upgrade later
  const tax = subtotal * 0.12;
  const total = subtotal - discount + tax;

  // 💳 CHECKOUT
  const checkout = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    const orderData = {
      items: cart,
      subtotal,
      discount,
      tax,
      total,
      payment: Number(payment),
      change: Number(payment) - total,
    };

    try {
      const res = await axios.post(`${API}/api/orders`, orderData);

      if (res.data?.success || res.data?.id) {
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
              className="p-4 bg-white rounded-xl shadow cursor-pointer hover:shadow-lg"
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
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2"
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

        {/* 💰 SUMMARY */}
        <div className="border-t pt-3">

          <h3 className="font-bold">Subtotal: ₱{subtotal.toFixed(2)}</h3>
          <h3 className="text-sm">Discount: ₱{discount.toFixed(2)}</h3>
          <h3 className="text-sm">Tax: ₱{tax.toFixed(2)}</h3>

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
            Change: ₱
            {payment
              ? (Number(payment) - total).toFixed(2)
              : "0.00"}
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
