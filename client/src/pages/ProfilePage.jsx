import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function getInitials(name = "") {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRole(role) {
  return role === "admin" ? "Administrator" : "Customer";
}

function formatDateOfBirth(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const { user, updateProfile, uploadImage, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setPreviewImage(data.secure_url);
        await updateProfile({ name, email, dateOfBirth, image: data.secure_url });
        setBanner("Avatar updated!");
      } else {
        setBanner(data.error?.message || "Upload failed");
      }
    } catch (err) {
      setBanner(err.message || "Upload error");
    } finally {
      e.target.value = "";
    }
  }

  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);

  function handleStartEdit() {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setDateOfBirth(user?.dateOfBirth ?? "");
    setFieldErrors({});
    setBanner("");
    setEditing(true);
  }

  function handleCancel() {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setDateOfBirth(user?.dateOfBirth ?? "");
    setFieldErrors({});
    setBanner("");
    setEditing(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setBanner("");
    setPending(true);
    try {
      await updateProfile({ name, email, dateOfBirth });
      setEditing(false);
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
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-top-bar">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>

        <div className="profile-header">
          <div
            className="profile-avatar"
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to update avatar"
          >
            {(user?.image || previewImage) ? (
              <img
                src={previewImage || user?.image}
                alt={user?.name || "Profile"}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleAvatarUpload}
          />
          <div className="profile-header-info">
            <h1 className="profile-name">{user?.name}</h1>
            <span className="profile-role">{formatRole(user?.role)}</span>
          </div>
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            {banner && <p className="auth-banner">{banner}</p>}

            <label className="profile-field">
              <span className="profile-field-label">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                disabled={pending}
              />
              {fieldErrors.name && (
                <span className="auth-error">{fieldErrors.name}</span>
              )}
            </label>

            <label className="profile-field">
              <span className="profile-field-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={pending}
              />
              {fieldErrors.email && (
                <span className="auth-error">{fieldErrors.email}</span>
              )}
            </label>

            <label className="profile-field">
              <span className="profile-field-label">Date of Birth</span>
              <input
                type="date"
                value={dateOfBirth ? new Date(dateOfBirth).toISOString().split("T")[0] : ""}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={pending}
              />
              {fieldErrors.dateOfBirth && (
                <span className="auth-error">{fieldErrors.dateOfBirth}</span>
              )}
            </label>

            <div className="profile-actions">
              <button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={pending}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="profile-details">
              <div className="profile-detail">
                <dt>Name</dt>
                <dd>{user?.name}</dd>
              </div>
              <div className="profile-detail">
                <dt>Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div className="profile-detail">
                <dt>Born</dt>
                <dd>{formatDateOfBirth(user?.dateOfBirth)}</dd>
              </div>
              <div className="profile-detail">
                <dt>Role</dt>
                <dd>{formatRole(user?.role)}</dd>
              </div>
            </dl>

            <div className="profile-actions">
              <button type="button" onClick={handleStartEdit}>
                Edit Profile
              </button>
              <button type="button" onClick={handleLogout} className="btn-ghost">
                Log out
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
}