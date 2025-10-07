//import { useState } from "react";

import { Route, Routes } from "react-router-dom";
import "./App.css";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "@popperjs/core"; // <-- Importa Popper primero
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Usa el bundle que ya incluye Popper

import Home from "./pages/home/Home";
import Comercial from "./pages/comercial/Comercial.jsx";
import Recaudacion from "./pages/recaudacion/Recaudacion.jsx";
import DeudaConsulta from "./pages/deuda/deuda.jsx";
import ConsultaCedula from "./pages/deuda/ConsultaCedula.jsx";

function App() {
  return (
    <>
      <Routes>
        {/*<Route path="/login" element={<Login />} />*/}
        <Route path="/" element={<Home />} />
        <Route path="/Comercial" element={<Comercial />} />
        <Route path="/Recaudacion" element={<Recaudacion />} />
        <Route path="/DeudaConsulta" element={<DeudaConsulta />} />
        <Route path="/CedulaConsulta" element={<ConsultaCedula />} />
      </Routes>
    </>
  );
}

export default App;
