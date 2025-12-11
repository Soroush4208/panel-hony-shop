import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { authApi } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      if (token && !user) {
        try {
          const me = await authApi.me();
          setUser(me);
          localStorage.setItem("authUser", JSON.stringify(me));
        } catch (error) {
          logout();
        }
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("authUser", JSON.stringify(response.user));
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      loading,
      isAuthenticated: Boolean(token)
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useAuth() {
  return useContext(AuthContext);
}

