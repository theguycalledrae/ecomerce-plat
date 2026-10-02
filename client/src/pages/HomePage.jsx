import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <main className="app">
      <h1>Ecommerce Platform</h1>
      <p>
        Logged in as <strong>{user?.name}</strong> ({user?.email}) —{" "}
        role {user?.role}
      </p>
      <div className="home-actions">
        <Link to="/profile" className="btn-primary">
          View Profile
        </Link>
        <button type="button" onClick={handleLogout} className="btn-ghost">
          Log out
        </button>
      </div>
    </main>
  );
}

