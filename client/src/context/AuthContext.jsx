import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { authApi, uploadApi } from "../api/client.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount: the cookie carries the token, /me returns
  // the user. 401 → stay logged out.
  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await authApi.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user } = await authApi.register({ name, email, password });
    setUser(user);
    return user;
  }, []);

  const updateProfile = useCallback(async ({ name, email, dateOfBirth }) => {
    const { user } = await authApi.updateProfile({ name, email, dateOfBirth });
    setUser(user);
    return user;
  }, []);

  const uploadImage = useCallback(async (file) => {
    const { user } = await uploadApi.uploadImage(file);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    // Even if the call fails locally, drop the session state.
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, uploadImage, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

