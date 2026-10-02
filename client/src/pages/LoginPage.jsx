import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setBanner("");
    setPending(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/products", { replace: true });
    } catch (err) {
      if (err.errors) {
        const byField = {};
        for (const { field, message } of err.errors) {
          byField[field] = message;
        }
        setFieldErrors(byField);
      } else {
        setBanner(err.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>
        {banner && <p className="auth-banner">{banner}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && (
            <span className="auth-error">{fieldErrors.email}</span>
          )}
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {fieldErrors.password && (
            <span className="auth-error">{fieldErrors.password}</span>
          )}
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register" state={location.state}>Register</Link>
        </p>
      </form>
    </main>
  );
}

