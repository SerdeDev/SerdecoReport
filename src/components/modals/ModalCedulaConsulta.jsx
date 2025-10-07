import React, { useState } from "react";
import { BASE_API_URL } from "../core/constants";

// Componente principal para consultar cuentas por cédula
export default function ConsultaCedula({ cedulaInicial }) {
  // Estados del formulario
  const [cedula, setCedula] = useState(cedulaInicial || "");
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState("");
  const [resultadoDeuda, setResultadoDeuda] = useState("");
  const [errorDeuda, setErrorDeuda] = useState("");
  const [cargando, setCargando] = useState(false);

  // Consulta de cuentas asociadas a la cédula
  const consultarCuentas = async () => {
    setError("");
    setCuentas([]);
    setResultadoDeuda("");
    setErrorDeuda("");
    setCargando(true);

    // Validación de cédula (6 a 10 dígitos)
    if (!/^\d{6,10}$/.test(cedula)) {
      setError("⚠️ Ingresa una cédula válida (6 a 10 dígitos).");
      setCargando(false);
      return;
    }

    console.time("consultaCuentas");

    try {
      const res = await fetch(`${BASE_API_URL}/getUsuarioCatastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula }),
      });

      if (!res.ok) throw new Error("Error de red");

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
      console.error("Error consultando cuentas:", err);
      setError("❌ No se pudo realizar la consulta. Verifica tu conexión.");
    } finally {
      console.timeEnd("consultaCuentas");
      setCargando(false);
    }
  };

  // Limpia todos los estados del formulario
  const limpiarFormulario = () => {
    setCedula("");
    setCuentas([]);
    setError("");
    setResultadoDeuda("");
    setErrorDeuda("");
  };

  // Copia una cuenta al portapapeles
  const copiarCuenta = (cuenta) => {
    navigator.clipboard.writeText(cuenta);
    alert(`Cuenta ${cuenta} copiada al portapapeles`);
  };

  // Consulta la deuda asociada a una cuenta contrato
  const consultarDeuda = async (cuentaContrato) => {
    setResultadoDeuda("");
    setErrorDeuda("");

    if (!/^\d{12}$/.test(cuentaContrato)) {
      setErrorDeuda("⚠️ El número ingresado no tiene 12 dígitos válidos.");
      return;
    }

    const digitoVerificador = calcularDigitoVerificador(cuentaContrato);

    try {
      const res = await fetch(
        `/corpoelec/CorpoelecRest/rest/OficinaService/SaldoDetalle/${cuentaContrato}`
      );
      const datos = await res.json();

      const deudaAseo = Number(datos.deudaAseoTotal) || 0;
      const deudaRelleno = Number(datos.deudaRellenoTotal) || 0;
      const total = deudaAseo + deudaRelleno;

      const formatoBsD = new Intl.NumberFormat("es-VE", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      });

      const deudaAseoFmt = `${formatoBsD.format(deudaAseo)} Bs`;
      const deudaRellenoFmt = `${formatoBsD.format(deudaRelleno)} Bs`;
      const totalFmt = `${formatoBsD.format(total)} Bs`;

      if (total === 0) {
        setResultadoDeuda(
          `✅ La cuenta contrato ${cuentaContrato} no presenta deudas.`
        );
      } else {
        setResultadoDeuda(
          <div
            style={{
              background: "#f0f6ff",
              borderLeft: "4px solid #1c5e32",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "24px",
            }}
          >
            <h4 style={{ color: "#1c5e32", marginBottom: "12px" }}>
              <strong>
                {cuentaContrato}.{digitoVerificador}
              </strong>
            </h4>

            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              {deudaAseo > 0 && (
                <p
                  style={{
                    fontSize: "1.2em",
                    color: "#d9534f",
                    fontWeight: "bold",
                  }}
                >
                  Aseo Urbano: {deudaAseoFmt}
                </p>
              )}
              {deudaRelleno > 0 && (
                <p
                  style={{
                    fontSize: "1.2em",
                    color: "#d9534f",
                    fontWeight: "bold",
                  }}
                >
                  Relleno Sanitario: {deudaRellenoFmt}
                </p>
              )}
            </div>

            <p style={{ fontSize: "1.3em", fontWeight: "bold" }}>
              Total: {totalFmt}
            </p>
            <p style={{ fontSize: "1em", marginTop: "8px" }}>
              Correspondiente a la deuda hasta la fecha:{" "}
              {new Date().toLocaleDateString("es-VE")}
            </p>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <a
                href="https://ov-capital.corpoelec.gob.ve/index.php/Login/saldo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  background: "#1c5e32",
                  color: "#fff",
                  padding: "12px 32px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "1.1em",
                  fontWeight: "bold",
                }}
              >
                Oficina Virtual
              </a>
            </div>

            <p style={{ fontSize: "0.95em", color: "#444", marginTop: "20px" }}>
              Este mensaje ha sido generado automáticamente por los sistemas
              institucionales de SERDECO y está destinado exclusivamente al
              titular de la cuenta contrato.
            </p>
            <p style={{ fontSize: "0.9em", color: "#555" }}>
              Si tiene alguna duda, puede escribirnos a{" "}
              <strong>cobranza@serdeco.com.ve</strong>.
            </p>
          </div>
        );
      }
    } catch (err) {
      console.error("Error consultando deuda:", err);
      setErrorDeuda("❌ No se pudo consultar la deuda.");
    }
  };

  // Algoritmo para calcular dígito verificador
  const calcularDigitoVerificador = (cuentaContrato) => {
    const multiplicadores = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      suma += parseInt(cuentaContrato[i], 10) * multiplicadores[i];
    }
    const residuo = suma % 11;
    return residuo === 0 ? 1 : residuo === 1 ? 0 : 11 - residuo;
  };

  // Renderizado del componente
  return (
    <div>
      <h3>
        <strong>Consulta de Cuenta por Cédula</strong>
      </h3>

      {/* Input para ingresar cédula */}
      <div className="mb-3">
        <input
          type="text"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          placeholder="Ingresa solo n° cédula, sin identificación fiscal (V)-(E)-(J)-(G)"
          className="form-control"
        />
      </div>

      {/* Botones de acción */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-primary"
          onClick={consultarCuentas}
          disabled={cargando}
        >
          {cargando ? "Consultando..." : "Consultar"}
        </button>
        <button className="btn btn-secondary" onClick={limpiarFormulario}>
          Limpiar
        </button>
      </div>

      {/* Spinner de carga */}
      {cargando && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Consultando cédula, por favor espera...</p>
        </div>
      )}

      {/* Mensaje de error si falla la consulta */}
      {error && <p className="text-danger">{error}</p>}

      {/* Lista de cuentas encontradas */}
      {cuentas.length > 0 && (
        <ul className="list-group">
          {cuentas.map((cuenta) => (
            <li
              key={cuenta}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {/* Muestra la cuenta contrato */}
              📌 {cuenta}
              {/* Botones para copiar y consultar deuda */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => copiarCuenta(cuenta)}
                >
                  Copiar
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => consultarDeuda(cuenta)}
                >
                  Ver Deuda
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Error al consultar deuda */}
      {errorDeuda && <p className="text-danger mt-3">{errorDeuda}</p>}

      {/* Resultado de la deuda (HTML o texto) */}
      {resultadoDeuda && <div className="mt-3">{resultadoDeuda}</div>}
    </div>
  );
}
