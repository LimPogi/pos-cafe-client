import { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const [editingId, setEditingId] = useState(null);

  // 🔄 FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await apiFetch("https://pos-cafe-server.onrender.com/api");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ ADD / UPDATE
  const handleSubmit = async () => {
    try {
      const url = editingId
        ? `https://pos-cafe-server.onrender.com/api/${editingId}`
        : "https://pos-cafe-server.onrender.com/api";

      const method = editingId ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      setForm({ name: "", price: "", stock: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Save product error:", err);
      alert("Error saving product");
    }
  };

  // ✏️ EDIT
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
    });
    setEditingId(p.id);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(
        `https://pos-cafe-server.onrender.com/api/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting product");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Product Management</h2>

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <button onClick={handleSubmit}>
          {editingId ? "Update" : "Add"} Product
        </button>
      </div>

      {/* LIST */}
      {products.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <p>
            {p.name} - ₱{p.price} (Stock: {p.stock})
          </p>

          <button onClick={() => handleEdit(p)}>Edit</button>
          <button onClick={() => handleDelete(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default ProductManager;
