import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = Cookies.get("token");
    if (token) {
      axios
        .post("http://localhost:5022/api/auth/verifyToken", { token })
        .then((response) => {
          fetchUserById(response.data.employeeId).then((user) => {
            setUser(user);
            navigate(`/${user?.role.roleName.toLowerCase()}/dashboard`, { replace: true });
          });
        })
        .catch(() => {
          Cookies.remove("token");
          navigate("/signin");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
    navigate("/signin");
      setLoading(false);
    }
  }, []);

  const fetchUserById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5022/api/auth/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "User not found" };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5022/api/auth/login",
        { email, password }
      );
      const { token, employeeId } = response.data;
      Cookies.set("token", token, { expires: 1 / 24 }); // 1 hour
      const user = await fetchUserById(employeeId);
      setUser(user);
      console.log("user", user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  };

  const signup = async (email, password, name, departmentId) => {
    try {
      const response = await axios.post(
        "http://localhost:5022/api/auth/register",
        { email, password, name: name, departmentId: departmentId }
      );
      const { token, employeeId } = response.data;
      Cookies.set("token", token, { expires: 1 / 24 }); // 1 hour
      const user = await fetchUserById(employeeId);
      setUser(user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Registration failed" };
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
