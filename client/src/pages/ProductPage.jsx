import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
        else setError("Not found");
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main><p>Loading…</p></main>;
  if (error || !product) return <main><p>{error || "Not found"}</p></main>;

  return (
    <main className="product-page">
      <Link to="/" className="back-link">← Back</Link>
      <div className="product-detail">
        <img src={product.image} alt={product.name} />
        <h1>{product.name}</h1>
        <p className="product-category">{product.category}</p>
        <p className="product-price">${product.price}</p>
        <p className="product-desc">{product.description}</p>
      </div>
    </main>
  );
}

export default ProductPage;
