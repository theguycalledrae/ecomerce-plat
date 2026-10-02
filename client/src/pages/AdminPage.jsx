import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { uploadApi } from "../api/client.js";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", image: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/");
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || []));
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" });
    if (res.ok) {
      setForm({ name: "", description: "", price: "", category: "", image: "" });
      setEditingId(null);
      fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || []));
    }
  }

  async function handleDelete(id) {
    fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
    setProducts(products.filter(p => p._id !== id));
  }

  function edit(p) {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image || "" });
    setEditingId(p._id);
  }

  function handleBrowse() {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = 'image/*';
    i.onchange = async (e) => {
      if (e.target.files?.[0]) {
        const { imageUrl } = await uploadApi.uploadImage(e.target.files[0]);
        setForm({ ...form, image: imageUrl || '' });
      }
    };
    i.click();
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>
      <p>Overview — Logged in as <strong>{user?.name || "Admin"}</strong> ({user?.email}) — role <strong>{user?.role}</strong></p>
      <hr style={{ margin: "20px 0" }} />

      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
        <button type="button" onClick={handleBrowse}>Browse Image</button>
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", description: "", price: "", category: "", image: "" }); }}>Cancel</button>}
      </form>

      <h2>Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Image</th><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td><img src={p.image} alt={p.name} style={{ width: 60, height: 60, objectFit: "cover" }} /></td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
              <td>
                <button onClick={() => edit(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={async () => { await logout(); navigate("/login"); }} style={{ marginTop: 30 }}>Logout</button>
    </main>
  );
}
