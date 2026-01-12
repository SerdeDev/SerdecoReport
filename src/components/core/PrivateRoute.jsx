import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { auth } = useContext(AuthContext);

  if (!auth) return <Navigate to="/login" />;
  if (roles && !roles.includes(auth.role.toLowerCase())) return <Navigate to="/login" />;

  return children;
}
