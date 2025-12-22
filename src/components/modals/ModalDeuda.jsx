import { useState } from "react";
import FormDeuda from "../form/FormDeuda";
import { exportToExcel } from "../../func/pasarExcel";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Table from "../Table";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function ModalDeuda({
  show,
  handleClose,
  handleShowToast,
  estatus,
}) {
  const defaultValues = {
    interlocutor: "",
    cedula: "",
    tipoCedula: "",
    cuentaContrato: "",
    estado: null,
    municipio: null,
    servicio: null,
    cnaeResidencial: false,
    cnaeComercial: false,
    cnaeIndustrial: false,
    cnaeNoFaturable: false,
  };

  const [selectedReporte, setSelectedReporte] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [datos, setDatos] = useState("");
  const [resumenDeuda, setResumenDeuda] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const resultadosPorPagina = 10;
  const endpoint = "http://10.200.10.249:3001/api";

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
    console.log("Datos enviados:", data);
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/getDeuda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Resultados de la consulta:", result);
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
        exportToExcel(items, `DEUDA_${fileNameParts}.xlsx`);
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
        `DEUDA${fileNameParts ? "_" + fileNameParts : ""}.xlsx`
      );
      setProgress(60); // Simula progreso
    }
    setProgress(100);
  };
  const generaResumen = async (selected) => {
    setLoadingResumen(true); // desactiva el botón

    try {
      let url = "";
      if (selected === "resumen_CNAE") url = `${endpoint}/getDeudaCnae`;
      if (selected === "resumen_estado") url = `${endpoint}/getDeudaEstado`;
      if (selected === "resumen_publicos")
        url = `${endpoint}/getDeudaCnaePublicos`;
      if (selected === "resumen_privados")
        url = `${endpoint}/getDeudaCnaePrivados`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus }),
      });

      const data = await response.json();
      setResumenDeuda(data);
      console.log("Resumen generado:", selected, data);
    } catch (error) {
      console.error("Error generando resumen:", error);
      handleShowToast("Error al generar resumen");
    } finally {
      setLoadingResumen(false); // reactiva el botón
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalDeuda"
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
                {/*Reportes Deuda*/}
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
                  Reportes Deuda
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
                  {/*<option value="especifica">Deuda Específica</option>*/}
                  <option value="resumen_CNAE">Resumen por CNAE</option>
                  <option value="resumen_estado">Resumen por estado</option>
                  <option value="resumen_privados">
                    Resumen por usuarios privados
                  </option>
                  <option value="resumen_publicos">
                    Resumen por usuarios publicos
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
              {/*<div
                className={`collapse${resultados.length === 0 ? " show" : ""}`}
                id="collapseFormDeuda"
              >
                {selectedReporte === "especifica" && (
                  <FormDeuda
                    onSubmit={onSubmit}
                    defaultValues={defaultValues}
                    handleClose={handleClose}
                  />
                )}
              </div>*/}

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
                          <th>Cuenta Contrato</th>
                          <th>CNAE</th>
                          <th>Cedula</th>
                          <th>Nombre</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayResultados.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.interlocutor}</td>
                            <td>{item.cuentaContrato}</td>
                            <td>{item.cnae}</td>
                            <td>{item.cedula}</td>
                            <td>{item.nombre}</td>
                            <td>{item.total}</td>
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
              {selectedReporte === "resumen_CNAE" &&
                resumenDeuda.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenDeuda}
                        nombre={"RESUMEN_DEUDA_CNAE.xlsx"}
                      />
                    </div>
                  </>
                )}
              {selectedReporte === "resumen_estado" &&
                resumenDeuda.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenDeuda}
                        nombre={"RESUMEN_DEUDA_ESTADO.xlsx"}
                      />
                    </div>
                  </>
                )}

              {selectedReporte === "resumen_publicos" &&
                resumenDeuda.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenDeuda}
                        nombre={"RESUMEN_DEUDA_PUBLICOS.xlsx"}
                      />
                    </div>
                  </>
                )}
              {selectedReporte === "resumen_privados" &&
                resumenDeuda.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenDeuda}
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
