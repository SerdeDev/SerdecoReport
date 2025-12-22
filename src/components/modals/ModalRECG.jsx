import { useState } from "react";
import { exportToExcel } from "../../func/pasarExcel";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Table from "../Table";
import FormRECG from "../form/FormRECG";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { useEffect } from "react";

function FechaFormateada({ fechaISO }) {
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const opciones = { day: "2-digit", month: "long", year: "numeric" };
    return fecha.toLocaleDateString("es-VE", opciones);
  };

  return <p>{formatearFecha(fechaISO)}</p>;
}

export default function ModalRECG({
  show,
  handleClose,
  handleShowToast,
  estatus,
}) {
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const resultadosPorPagina = 10;
  const endpoint = "http://10.200.10.249:3001/api";

  useEffect(() => {
    const fetchMesesDisponibles = async () => {
      try {
        const response = await fetch(`${endpoint}/getRecgMesesDisponibles`);
        const data = await response.json();
        setMesesDisponibles(data);
      } catch (error) {
        console.error("Error al cargar meses disponibles:", error);
      }
    };

    fetchMesesDisponibles();
  }, []);

  const defaultValues = {
    interlocutor: null,
    estado: null,
    municipio: null,
    servicio: null,
  };

  const [selectedReporte, setSelectedReporte] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [datos, setDatos] = useState("");
  const [resumenRECG, setResumenRECG] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(false);

  // Lógica de paginación
  const pagesVisited = currentPage * resultadosPorPagina;
  const displayResultados = resultados.slice(
    pagesVisited,
    pagesVisited + resultadosPorPagina
  );
  const pageCount = Math.ceil(resultados.length / resultadosPorPagina);

  const changePage = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleReporteChange = (event) => {
    setSelectedReporte(event.target.value);
    setResultados([]);
    setCurrentPage(0);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/getRecg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      setResultados(result);
      setDatos(data);
      if (!result || result.length === 0) {
        handleShowToast("No se encontraron resultados");
        setLoading(false);
        setProgress(0);
        return;
      }
      handleShowToast("Consulta realizada correctamente");
    } catch (error) {
      console.error("Error enviando datos:", error);
      handleShowToast("Error al consultar");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1000);
    }
  };

  const Exportar = (result, data) => {
    setProgress(10);
    if (!data.interlocutor) {
      // Agrupar por interlocutor
      const grupos = result.reduce((acc, item) => {
        if (!acc[item.interlocutor]) acc[item.interlocutor] = [];
        acc[item.interlocutor].push(item);
        return acc;
      }, {});

      Object.entries(grupos).forEach(([inter, items]) => {
        const fileNameParts = [
          inter,
          data.cedula,
          data.cuentaContrato,
          data.estado,
          data.municipio,
        ]
          .filter(Boolean)
          .join("_");
        exportToExcel(items, `RECG_${fileNameParts}.xlsx`);
      });
      setProgress(60); // Simula progreso
    } else {
      const fileNameParts = [
        data.interlocutor,
        data.cedula,
        data.cuentaContrato,
        data.estado,
        data.municipio,
      ]
        .filter(Boolean)
        .join("_");
      exportToExcel(
        result,
        `RECG${fileNameParts ? "_" + fileNameParts : ""}.xlsx`
      );
      setProgress(60); // Simula progreso
    }
    setProgress(100);
  };
  const generaResumen = async (selected) => {
    setLoadingResumen(true);

    let fechaInicio = null;
    let fechaFin = null;

    if (mesSeleccionado) {
      const [año, mes] = mesSeleccionado.split("-");
      fechaInicio = new Date(año, mes - 2, 1);
      fechaFin = new Date(año, mes - 1, 1);
    }

    try {
      let url = "";
      if (selected === "resumen_totales") {
        url = `${endpoint}/getRecgTotales`;
      } else if (selected === "resumen_operadoras") {
        url = `${endpoint}/getRecgTotalesOperadoras`;
      } else if (selected === "resumen_privados") {
        url = `${endpoint}/getRecgTotalesPrivados`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estatus,
          fechaInicio,
          fechaFin,
        }),
      });

      const result = await response.json();
      setResumenRECG(result);

      if (!result || result.length === 0) {
        handleShowToast("No se encontraron resultados");
      } else {
        handleShowToast("Consulta realizada correctamente");
      }
    } catch (error) {
      console.error("Error enviando datos:", error);
      handleShowToast("Error al consultar");
    } finally {
      setLoadingResumen(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalRECG"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="modalTitleId"
        aria-hidden={!show ? "true" : "false"}
      >
        <div className="modal-dialog modal-fullscreen" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitleId">
                {/*Reportes Control de Gestión RECG*/}
              </h5>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                  aria-label="Cerrar"
                  disabled={loading || loadingResumen}
                  style={{
                    backgroundColor: "#198754",
                    color: "white",
                    border: "none",
                    opacity: loading || loadingResumen ? 0.6 : 1,
                    cursor:
                      loading || loadingResumen ? "not-allowed" : "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </button>

                <h5 className="modal-title ms-3 mb-0" id="modalTitleId">
                  Reportes RECG
                </h5>
              </div>
            </div>
            <div className="modal-body">
              <div className="col form-floating mb-3 mt-3">
                <select
                  className="form-control"
                  id="floatingConsultaType"
                  aria-label="Seleccione Reporte"
                  value={selectedReporte}
                  onChange={handleReporteChange}
                >
                  <option value="">Seleccione</option>
                  <option value="especifica">RECG Específica</option>
                  <option value="resumen_totales">Resumen Totales</option>
                  <option value="resumen_operadoras">
                    Resumen por Operadoras
                  </option>
                  {/* Agrega más opciones según tus reportes */}
                </select>
                <label className="z-0" htmlFor="floatingConsultaType">
                  Reportes
                </label>
              </div>
              {selectedReporte != "especifica" &&
                selectedReporte.length > 0 && (
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end me-3">
                    <button
                      className="btn btn-success"
                      type="button"
                      onClick={() => generaResumen(selectedReporte)}
                      disabled={loadingResumen}
                    >
                      {loadingResumen ? "Generando..." : "Generar Resumen"}
                    </button>
                  </div>
                )}
              {/* Botón para mostrar/ocultar el formulario si hay resultados */}
              {resultados && resultados.length > 0 && (
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    className="btn btn-success"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseFormDeuda"
                    aria-expanded={resultados.length === 0 ? "true" : "false"}
                    aria-controls="collapseFormDeuda"
                  >
                    {resultados.length === 0
                      ? "Ocultar formulario"
                      : "Formulario de búsqueda"}
                  </button>
                </div>
              )}

              {selectedReporte !== "especifica" && (
                <div className="col form-floating mb-3">
                  <select
                    className="form-control"
                    id="floatingMesSeleccionado"
                    aria-label="Seleccione Mes"
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione mes</option>
                    {mesesDisponibles.map((mes) => {
                      const [year, month] = mes.split("-");
                      const nombreMes = new Date(
                        Number(year),
                        Number(month) - 1
                      ).toLocaleDateString("es-VE", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <option key={mes} value={mes}>
                          {nombreMes}
                        </option>
                      );
                    })}
                  </select>
                  <label className="z-0" htmlFor="floatingMesSeleccionado">
                    Mes
                  </label>
                </div>
              )}

              {/* Barra de progreso */}
              {loading && (
                <div
                  className="progress mb-3"
                  role="progressbar"
                  aria-label="Basic example"
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  >
                    {progress}%
                  </div>
                </div>
              )}

              {/* Formulario dentro del collapse */}
              <div
                className={`collapse${resultados.length === 0 ? " show" : ""}`}
                id="collapseFormDeuda"
              >
                {selectedReporte === "especifica" && (
                  <FormRECG
                    onSubmit={onSubmit}
                    defaultValues={defaultValues}
                    handleClose={handleClose}
                  />
                )}
              </div>

              {/* Tabla de resultados */}
              {resultados && resultados.length > 0 && (
                <>
                  <div className="d-grid gap-2 d-md-flex">
                    <button
                      className="btn btn-success"
                      onClick={() => Exportar(resultados, datos)}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                  <div className="table-responsive m-4 ">
                    <table className="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Interlocutor</th>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Monto</th>
                          <th>Iva</th>
                          <th>Monto Plus</th>
                          <th>Iva Plus</th>
                          <th>Retención Iva</th>
                          <th>Retención Iva Plus</th>
                          <th>Pago Anticipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayResultados.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.interlocutor}</td>
                            <td>{item.producto}</td>
                            <td>{item.cantidad}</td>
                            <td>{item.monto}</td>
                            <td>{item.iva}</td>
                            <td>{item.montoPlus}</td>
                            <td>{item.ivaPlus}</td>
                            <td>{item.retencionIva}</td>
                            <td>{item.retencionIvaPlus}</td>
                            <td>{item.pagoAnticipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ReactPaginate
                    previousLabel={"Anterior"}
                    nextLabel={"Siguiente"}
                    pageCount={pageCount}
                    onPageChange={changePage}
                    containerClassName={"pagination"}
                    previousLinkClassName={"page-link"}
                    nextLinkClassName={"page-link"}
                    disabledClassName={"disabled"}
                    activeClassName={"active"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                  />
                </>
              )}
              {selectedReporte === "resumen_totales" &&
                resumenRECG.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenRECG}
                        nombre={"RESUMEN_RECG_TOTALES.xlsx"}
                      />
                    </div>
                  </>
                )}
              {selectedReporte === "resumen_operadoras" &&
                resumenRECG.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenRECG}
                        nombre={"RESUMEN_RECG_OPERADORA.xlsx"}
                      />
                    </div>
                  </>
                )}

              {selectedReporte === "resumen_privados" &&
                resumenRECG.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenRECG}
                        nombre={"RESUMEN_DEUDA_PRIVADOS.xlsx"}
                      />
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
