import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import serdecoLogo from "../../assets/img/logoserdeco.png"; // 👈 logo institucional
import "../../App.css"; // 👈 estilos corporativos

export default function Login() {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await axios.post("/api/auth/login", { correo, password });
      login(data); // guarda token y rol en contexto/localStorage
      navigate("/Home"); // redirige al Home
    } catch (err) {
      setError("Correo o contraseña incorrectos o error de conexión.");
      console.error("Error en login:", err);
    }
  };

  return (
    <div id="root">
      <div className="login-card">
        {/* Logo institucional */}
        <img src={serdecoLogo} alt="SERDECO Logo" className="login-logo" />

        {/* Título corporativo */}
        <h3 className="login-title">Portal Institucional</h3>

        {/* Mensaje de error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="btn login-btn w-100">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
