import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { exportToExcel } from "../../func/pasarExcel";
import Select from "react-select";

export default function ModalDeudaCorpoelec({
  show,
  handleClose,
  handleShowToast,
}) {
  const [estado, setEstado] = useState(null);
  const [municipio, setMunicipio] = useState(null);
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const endpoint = "http://10.200.10.249:3001/api";

  useEffect(() => {
    fetch(`${endpoint}/operadoras`)
      .then((res) => res.json())
      .then((data) => {
        const estadosUnicos = [...new Set(data.map((d) => d.estado))].map(
          (e) => ({ value: e, label: e })
        );
        setEstados(estadosUnicos);

        const municipiosUnicos = data.map((d) => ({
          municipio: d.municipio,
          estado: d.estado,
        }));
        setMunicipios(municipiosUnicos);
      });
  }, []);

  const municipioOptions = municipios
    .filter((m) => !estado || m.estado === estado.value)
    .map((m) => ({ value: m.municipio, label: m.municipio }));

  const obtenerMontoCorpoelec = async (cuentaContrato) => {
    try {
      const res = await fetch(
        `http://10.16.2.99:8080/CorpoelecRest/rest/OficinaService/SaldoDetalle/${cuentaContrato}`
      );
      const data = await res.json();
      return data?.monto || 0;
    } catch (error) {
      console.error("Error consultando Corpoelec:", cuentaContrato, error);
      return "Error";
    }
  };

  const validarCatastro = async (cuentaContrato) => {
    try {
      const res = await fetch(`${endpoint}/getCatastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuentaContrato }),
      });
      const data = await res.json();
      return data?.existe === true;
    } catch (error) {
      console.error("Error validando catastro:", cuentaContrato, error);
      return false;
    }
  };

  const consultarOperadorasFiltradas = async (estado, municipio) => {
    try {
      const res = await fetch(`${endpoint}/getoperadorasFiltradas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado, municipio }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Respuesta no válida:", text);
        return [];
      }

      const data = await res.json();
      console.log(`📥 Operadoras recibidas: ${data.length}`);
      return data.map((d) => d.cuentaContrato);
    } catch (error) {
      console.error("❌ Error consultando operadoras filtradas:", error);
      return [];
    }
  };

  const consultarDeudaMasiva = async () => {
    if (!estado || !municipio) {
      handleShowToast("Seleccione estado y municipio");
      return;
    }

    setLoading(true);
    setResultados([]);
    console.clear();
    console.log("🟢 INICIO DE CONSULTA MASIVA DE DEUDA");
    console.log("📍 Estado seleccionado:", estado.value);
    console.log("📍 Municipio seleccionado:", municipio.value);

    try {
      const cuentas = await consultarOperadorasFiltradas(
        estado.value,
        municipio.value
      );
      console.log(`📥 Operadoras recibidas desde backend: ${cuentas.length}`);
      console.table(cuentas);

      const cuentasValidas = [];
      for (const cuenta of cuentas) {
        const esValida = await validarCatastro(cuenta);
        console.log(
          `🔍 Validando en catastro: ${cuenta} → ${
            esValida ? "✅ Válida" : "❌ Inválida"
          }`
        );
        if (esValida) cuentasValidas.push(cuenta);
      }

      console.log(
        `📋 Total cuentas válidas para consulta: ${cuentasValidas.length}`
      );
      console.table(cuentasValidas);

      const resultadosFinales = [];
      for (const cuenta of cuentasValidas) {
        console.log(`⏳ Consultando deuda en Corpoelec para: ${cuenta}`);
        const monto = await obtenerMontoCorpoelec(cuenta);
        console.log(`💰 Resultado: ${cuenta} → Monto: ${monto}`);
        resultadosFinales.push({ cuentaContrato: cuenta, monto });
      }

      console.log("✅ CONSULTA FINALIZADA");
      console.table(resultadosFinales);

      setResultados(resultadosFinales);
      handleShowToast("Consulta completada");
    } catch (error) {
      console.error("❌ ERROR en consulta masiva:", error);
      handleShowToast("Error al consultar deuda");
    } finally {
      setLoading(false);
    }
  };

  const exportar = () => {
    if (resultados.length === 0) return;
    exportToExcel(
      resultados,
      `DEUDA_CORPOELEC_${estado?.value}_${municipio?.value}.xlsx`
    );
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn"
                onClick={handleClose}
                disabled={loading}
                style={{
                  backgroundColor: "#198754",
                  color: "white",
                  border: "none",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
              </button>
              <h5 className="modal-title ms-3">
                Consulta Masiva Deuda Corpoelec
              </h5>
            </div>

            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">Estado</label>
                  <Select
                    options={estados}
                    value={estado}
                    onChange={(e) => {
                      setEstado(e);
                      setMunicipio(null);
                    }}
                    isClearable
                    placeholder="Seleccionar Estado"
                    isDisabled={loading}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Municipio</label>
                  <Select
                    options={municipioOptions}
                    value={municipio}
                    onChange={setMunicipio}
                    isClearable
                    placeholder="Seleccionar Municipio"
                    isDisabled={!estado || loading}
                  />
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  className="btn btn-success"
                  onClick={consultarDeudaMasiva}
                  disabled={loading}
                >
                  {loading ? "Consultando..." : "Consultar"}
                </button>
              </div>

              {resultados.length > 0 && (
                <>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                    <button className="btn btn-success" onClick={exportar}>
                      <FontAwesomeIcon icon={faDownload} /> Exportar
                    </button>
                  </div>

                  <div className="table-responsive mt-3">
                    <table className="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Cuenta Contrato</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.cuentaContrato}</td>
                            <td>{item.monto}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
