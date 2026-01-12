import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token ? { token, role } : null;
  });

  const navigate = useNavigate();

const login = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("name", data.name);
  localStorage.setItem("surname", data.surname);

  setAuth({
    token: data.token,
    role: data.role,
    name: data.name,
    surname: data.surname
  });
};




  const logout = () => {
    localStorage.clear();
    setAuth(null);
    navigate("/login"); // 👈 redirige al login
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
