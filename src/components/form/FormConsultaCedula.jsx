import { useState } from "react";

// Hook para manejar la lógica de consulta de cuentas por cédula
export const FormConsultaCedula = () => {
  const [cargando, setCargando] = useState(false); // Estado de carga
  const [error, setError] = useState(""); // Mensaje de error
  const [cuentas, setCuentas] = useState([]); // Lista de cuentas encontradas

  // Función principal para consultar cuentas
  const consultar = async (cedula) => {
    setError("");
    setCuentas([]);
    setCargando(true);

    // Validación básica de cédula (6 a 10 dígitos)
    if (!/^\d{6,10}$/.test(cedula)) {
      setError("⚠️ Ingresa una cédula válida (6 a 10 dígitos).");
      setCargando(false);
      return;
    }

    console.time("consultaCedula");

    try {
      const res = await fetch(
        "http://10.200.10.249:3001/api/postUsuarioCatastro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cedula }),
        }
      );

      if (!res.ok) throw new Error("Error en la consulta");

      const datos = await res.json();

      if (!Array.isArray(datos) || datos.length === 0) {
        setError(`⚠️ No se encontraron cuentas para la cédula ${cedula}.`);
      } else {
        const cuentasUnicas = [
          ...new Set(datos.map((d) => d.cuentaContrato).filter(Boolean)),
        ];
        setCuentas(cuentasUnicas);
      }
    } catch (err) {
      console.error("Error consultando cédula:", err);
      setError("❌ No se pudo realizar la consulta. Verifica tu conexión.");
    } finally {
      console.timeEnd("consultaCedula");
      setCargando(false);
    }
  };

  // Retorna los estados y la función de consulta
  return {
    consultar,
    cuentas,
    cargando,
    error,
  };
};
