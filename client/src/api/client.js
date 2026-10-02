const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(
      body.message || body.errors?.[0]?.message || "Request failed"
    );
    error.status = res.status;
    error.errors = body.errors;
    throw error;
  }
  return body;
}

export const authApi = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateProfile: (data) =>
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
};

/**
 * Upload a file to Cloudinary via the server.
 * Uses FormData so the browser sets the multipart Content-Type.
 */
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/upload", { method: "POST", body: formData });
  },
};

export default request;
