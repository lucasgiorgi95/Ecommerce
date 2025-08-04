"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken: (force?: boolean) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVerification, setLastVerification] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = useCallback(async () => {
    try {
      // Llamar al endpoint de logout
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Limpiar estado local independientemente del resultado de la API
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Forzar recarga de la página para asegurar que la UI se actualice
      window.location.href = "/";
    }
  }, []);

  const verifyToken = useCallback(
    async (force: boolean = false): Promise<boolean> => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return false;
        }

        // Evitar verificaciones muy frecuentes (menos de 5 minutos)
        const now = Date.now();
        if (!force && now - lastVerification < 5 * 60 * 1000) {
          return !!user; // Retornar el estado actual si la verificación es reciente
        }

        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        setLastVerification(now);

        if (data.valid && data.user) {
          return true;
        }

        // Token is invalid, clear user state
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      } catch (error) {
        console.error("Token verification error:", error);
        // On error, clear user state to be safe
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }
    },
    [lastVerification, user]
  );

  useEffect(() => {
    // Verificar token al cargar la aplicación - solo una vez
    if (initialized) return;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          // Primero establecer el usuario desde localStorage para evitar flash
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }

          // Verificar token directamente sin usar verifyToken para evitar bucle
          try {
            const response = await fetch("/api/auth/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!data.valid || !data.user) {
              // Token inválido, limpiar localStorage y estado
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
            }
          } catch (error) {
            console.error("Token verification error during init:", error);
            // En caso de error, limpiar todo
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // En caso de error, limpiar todo
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]); // Solo ejecutar una vez al montar el componente

  // Efecto separado para la verificación periódica
  useEffect(() => {
    if (!user || !initialized) return; // No configurar intervalo si no hay usuario o no está inicializado

    // Configurar verificación periódica del token (cada 30 minutos)
    const tokenCheckInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (!data.valid || !data.user) {
            // Token expirado, hacer logout automático
            logout();
          }
        } catch (error) {
          console.error("Periodic token verification error:", error);
          logout();
        }
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(tokenCheckInterval);
  }, [user, initialized, logout]); // Solo cuando el usuario cambia

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        verifyToken,
        refreshToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
