import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Cashier.css";
import jsPDF from "jspdf"; 

export default function Cashier() {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 🔐 AUTH CHECK
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "cashier") {
      navigate("/admin");
    }
  }, []);

  // 📦 FETCH PRODUCTS
  useEffect(() => {
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

    fetchProducts();
  }, []);

  useEffect(() => {
  const fetchLowStock = async () => {
    const res = await axios.get(`${API}/products/low-stock`);
    setLowStock(res.data);
  };

  fetchLowStock();
}, []);

{lowStock.length > 0 && (
  <div className="alert">
    ⚠️ Low Stock Items:
    {lowStock.map(p => (
      <p key={p.id}>{p.name} ({p.stock})</p>
    ))}
  </div>
)}

  // ➕ ADD TO CART
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ➖ DECREASE QTY
  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // 💰 CALCULATIONS
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  // 🧾 PRINT RECEIPT
  const printReceipt = (order) => {
    const w = window.open("", "_blank");

    w.document.write(`
      <h2>☕ Café Receipt</h2>
      <hr/>
      <p>Order ID: ${order.orderId}</p>
      <hr/>
      ${cart
        .map((i) => `<p>${i.name} x${i.qty} = ₱${i.price * i.qty}</p>`)
        .join("")}
      <hr/>
      <h3>Total: ₱${order.total}</h3>
      <p>Cash: ₱${order.payment}</p>
      <p>Change: ₱${order.change}</p>
      <hr/>
      <p>Thank you for visiting ☕</p>
    `);

    w.print();
  };

  // 🧾 PDF RECEIPT GENERATOR
  const generatePDF = (order, cart) => {
  const doc = new jsPDF();

  doc.text("☕ Café Receipt", 10, 10);
  doc.text(`Order ID: ${order.orderId}`, 10, 20);

  let y = 30;

  cart.forEach((item) => {
    doc.text(
      `${item.name} x${item.qty} - ₱${item.price * item.qty}`,
      10,
      y
    );
    y += 10;
  });

  doc.text(`Total: ₱${order.total}`, 10, y + 10);

  doc.save(`receipt-${order.orderId}.pdf`);
};

  // 💳 CHECKOUT (FINAL FIXED)
  const checkout = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    const user = JSON.parse(localStorage.getItem("user"));
    const cashPayment = Number(payment);

    if (!user) return navigate("/login");
    if (cashPayment < total) return alert("Insufficient payment");

    const orderData = {
      user_id: user.id,
      items: cart,
      total,
      payment: cashPayment,
      change: cashPayment - total,
    };

    try {
      const res = await axios.post(`${API}/api/orders`, orderData);

      if (res.data?.orderId) {
        alert("Order Successful! 🎉");

        printReceipt({
          orderId: res.data.orderId,
          total,
          payment: cashPayment,
          change: cashPayment - total,
        });

        setCart([]);
        setPayment("");
      } else {
        alert("Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during checkout");
    }
  };

  // 🎯 FILTER PRODUCTS
  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.category === filter);

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="container">

      {/* LEFT MENU */}
      <div className="categories">
        <h3>Menu</h3>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("drinks")}>☕ Drinks</button>
        <button onClick={() => setFilter("pastries")}>🥐 Pastries</button>
        <button onClick={() => setFilter("pasta")}>🍝 Pasta</button>
      </div>

      {/* CENTER PRODUCTS */}
      <div className="products">
        {filteredProducts.map((p) => (
          <div key={p.id} className="card">
            <h3>{p.name}</h3>
            <p>₱{p.price}</p>
            <p>{p.category}</p>

            <button onClick={() => addToCart(p)}>
              Add
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT CART */}
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
            {payment ? (Number(payment) - total).toFixed(2) : "0.00"}
          </p>

          <button className="checkout" onClick={checkout}>
            Checkout
          </button>
        </div>
      </div>

    </div>
  );
}
