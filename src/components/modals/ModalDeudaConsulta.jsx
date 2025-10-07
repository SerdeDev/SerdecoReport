import React, { useState } from "react";

export default function ConsultaDeuda({ handleShowToast }) {
  const [cuentaContrato, setCuentaContrato] = useState("");
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const consultarDeuda = async () => {
    setResultado("");
    setError("");
    setCargando(true);

    if (!/^\d{12}$/.test(cuentaContrato)) {
      setError("⚠️ El número ingresado no tiene 12 dígitos válidos.");
      setCargando(false);
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
        setResultado(
          `✅ La cuenta contrato ${cuentaContrato} no presenta deudas.`
        );
        handleShowToast("Cuenta sin deuda.");
      } else {
        setResultado(
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

        handleShowToast("Consulta realizada con éxito.");
      }
    } catch (err) {
      console.error("Error consultando deuda:", err);
      setError("❌ No se pudo consultar la deuda.");
      handleShowToast("Error al consultar deuda.");
    } finally {
      setCargando(false);
    }
  };

  const calcularDigitoVerificador = (cuentaContrato) => {
    const multiplicadores = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      suma += parseInt(cuentaContrato[i], 10) * multiplicadores[i];
    }
    const residuo = suma % 11;
    return residuo === 0 ? 1 : residuo === 1 ? 0 : 11 - residuo;
  };

  return (
    <div className="container my-4">
      <h4 className="mb-3">
        {" "}
        <strong>Consulta de Deuda</strong>
      </h4>
      <div className="mb-3">
        <input
          type="text"
          id="cuentaContrato"
          className="form-control"
          value={cuentaContrato}
          onChange={(e) => setCuentaContrato(e.target.value)}
          placeholder="Ingresa Cuenta Contrato (12 dígitos) Ej: 100001234567 "
        />
      </div>
      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={consultarDeuda}
          disabled={cargando}
        >
          {cargando ? "Consultando..." : "Consultar Deuda"}
        </button>
      </div>

      {error && <p className="text-danger mt-3">{error}</p>}
      {resultado && (
        <pre className="mt-3 bg-light p-3 rounded border">{resultado}</pre>
      )}
    </div>
  );
}
