import { Routes, Route } from "react-router-dom";
import "./App.css";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "@popperjs/core";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Home from "./pages/home/Home";
import Comercial from "./pages/comercial/Comercial.jsx";
import Recaudacion from "./pages/recaudacion/Recaudacion.jsx";
import DeudaConsulta from "./pages/deuda/deuda.jsx";
import ConsultaCedula from "./pages/deuda/ConsultaCedula.jsx";
import Login from "./pages/login/Login.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/core/PrivateRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login público */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Home público */}
        <Route path="/Home" element={<Home />} />

        {/* Comercial solo para rol "comercial" */}
        <Route
          path="/Comercial"
          element={
            <PrivateRoute roles={["comercial", "tecnologia"]}>
              <Comercial />
            </PrivateRoute>
          }
        />

        {/* Recaudación solo para rol "recaudacion" */}
        <Route
          path="/Recaudacion"
          element={
            <PrivateRoute roles={["recaudacion", "tecnologia"]}>
              <Recaudacion />
            </PrivateRoute>
          }
        />

        {/* Deuda accesible para comercial, recaudacion y tecnologia */}
        <Route
          path="/DeudaConsulta"
          element={
            <PrivateRoute roles={["comercial", "recaudacion", "tecnologia"]}>
              <DeudaConsulta />
            </PrivateRoute>
          }
        />



        {/* Consulta por cédula accesible para todos los roles */}
        <Route
          path="/CedulaConsulta"
          element={
            <PrivateRoute roles={["comercial", "recaudacion", "tecnologia"]}>
              <ConsultaCedula />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
