import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Cashier.css";

export default function Cashier() {
  const API = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // ✅ FIX

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

  // ➖ DECREASE QTY
  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // 🎯 FILTER PRODUCTS
  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.category === filter);

  // 💰 COMPUTATIONS
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discount = 0;
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
    return <div>Loading products...</div>;
  }

  return (
    <div className="container">

      {/* LEFT: CATEGORY */}
      <div className="categories">
        <h3>Menu</h3>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("drinks")}>☕ Drinks</button>
        <button onClick={() => setFilter("pastries")}>🥐 Pastries</button>
        <button onClick={() => setFilter("pasta")}>🍝 Pasta</button>
      </div>

      {/* CENTER: PRODUCTS */}
      <div className="products">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="card"
            onClick={() => addToCart(p)}
          >
            <h4>{p.name}</h4>
            <p>₱{p.price}</p>
          </div>
        ))}
      </div>

      {/* RIGHT: CART */}
      <div className="cart">
        <h3>Order</h3>

        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <span>{item.name} x{item.qty}</span>

            <div>
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <button onClick={() => addToCart(item)}>+</button>
            </div>
          </div>
        ))}

        {/* 💰 SUMMARY */}
        <div className="summary">
          <h4>Subtotal: ₱{subtotal.toFixed(2)}</h4>
          <h4>Tax: ₱{tax.toFixed(2)}</h4>
          <h2>Total: ₱{total.toFixed(2)}</h2>

          <input
            type="number"
            placeholder="Payment"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          />

          <p>
            Change: ₱
            {payment
              ? (Number(payment) - total).toFixed(2)
              : "0.00"}
          </p>

          <button className="checkout" onClick={checkout}>
            Checkout
          </button>
        </div>
      </div>

    </div>
  );
}
