import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

axios.defaults.withCredentials = true;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/users/profile");
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://localhost:5001/api/users/auth", {
        email,
        password,
      });
      setUser(data);
      toast.success("Logged in successfully!");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await axios.post("http://localhost:5001/api/users", {
        name,
        email,
        password,
        role,
      });
      setUser(data);
      toast.success("Registered successfully!");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5001/api/users/logout");
      setUser(null);
      toast.success("Logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
