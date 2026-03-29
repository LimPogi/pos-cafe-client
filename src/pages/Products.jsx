import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import "../styles/Login.css";
function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const fetchProducts = async () => {
    const res = await apiFetch("https://pos-cafe-server.onrender.com/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    await fetch("https://pos-cafe-server.onrender.com/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    setName("");
    setPrice("");
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await fetch(`https://pos-cafe-server.onrender.com/api/products/${id}`, {
      method: "DELETE",
    });

    fetchProducts();
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">📦 Products</h2>

      {/* FORM */}
      <div className="flex gap-2 mb-4">

        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={addProduct}
          className="bg-green-600 text-white px-4"
        >
          Add
        </button>

      </div>

      {/* LIST */}
      {products.map((p) => (
        <div key={p.id} className="flex justify-between border p-2 mb-2">

          <span>{p.name} - ₱{p.price}</span>

          <button
            onClick={() => deleteProduct(p.id)}
            className="text-red-500"
          >
            Delete
          </button>

        </div>
      ))}

    </div>
  );
}

export default Products;
