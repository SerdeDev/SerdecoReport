import { useState } from "react";
import FormCatastro from "../form/FormCatastro";
import { exportToExcel } from "../../func/pasarExcel";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Table from "../Table";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function ModalCatastro({
  show,
  handleClose,
  handleShowToast,

}) {
  const defaultValues = {
    interlocutor: "",
    cedula: "",
    tipoCedula: "",
    cuentaContrato: "",
    estado: null,
    municipio: null,
    servicio: "",
  };



  const [selectedReporte, setSelectedConsulta] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [datos, setDatos] = useState("");
  const [resumenCnae, setResumenCnae] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const resultadosPorPagina = 10; // Puedes ajustar este valor
  const enpoint = "http://10.200.10.249:3001/api";
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
    setSelectedConsulta(event.target.value);
    setResultados([]);
    setResumenCnae([]); // Limpia el resumenCnae al cambiar de reporte
    setCurrentPage(0); // Reinicia la página al cambiar de reporte
  };

  const onSubmit = async (data) => {
    console.log("Datos enviados:", data);

    setResultados([]); // 👈 Limpia la tabla antes de consultar
    setResumenCnae([]); // 👈 Por si acaso también limpia resumen
    setLoading(true);

    try {
      const response = await fetch(`${enpoint}/getCatastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      setDatos(data); // Guarda los datos enviados
      setResultados(result); // Muestra los nuevos resultados

      if (!result || result.length === 0) {
        handleShowToast("No se encontraron resultados");
        setLoading(false);

        return;
      }

      handleShowToast("Consulta realizada correctamente");
    } catch (error) {
      console.error("Error enviando datos:", error);
      handleShowToast("Error al consultar");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const Exportar = async (result, data) => {
    setLoadingExport(true);

    try {
      if (!data.interlocutor) {
        const grupos = result.reduce((acc, item) => {
          if (!acc[item.interlocutor]) acc[item.interlocutor] = [];
          acc[item.interlocutor].push(item);
          return acc;
        }, {});

        for (const [inter, items] of Object.entries(grupos)) {
          const fileNameParts = [
            inter,
            data.cedula,
            data.cuentaContrato,
            data.estado,
            data.municipio,
          ]
            .filter(Boolean)
            .join("_");
          await exportToExcel(items, `CATASTRO_${fileNameParts}.xlsx`);
        }
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
        await exportToExcel(
          result,
          `CATASTRO${fileNameParts ? "_" + fileNameParts : ""}.xlsx`
        );
      }

      handleShowToast("Exportación completada");
    } catch (error) {
      console.error("Error exportando:", error);
      handleShowToast("Error al exportar");
    } finally {
      setTimeout(() => {
        setLoadingExport(false);
      }, 1000);
    }
  };

  {
    /* Spinner de carga */
  }

  {
    loading && (
      <div className="text-center my-3">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Consultando cédula, por favor espera...</p>
      </div>
    );
  }

  const generaResumen = async (selected) => {
    setResumenCnae([]); // 👈 Limpia la tabla antes de generar
    setLoadingResumen(true);

    try {
      let url = "";
      if (selected === "resumen_cnae") {
        url = `${enpoint}/getCatastroCnae`;
      } else if (selected === "resumen_cnae_Precio0") {
        url = `${enpoint}/getCatastroCnaePrecio`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        
      });

      const data = await response.json();
      setResumenCnae(data);
      console.log("Resumen generado:", selected, data);
    } catch (error) {
      console.error("Error generando resumen:", error);
      handleShowToast("Error al generar resumen");
    } finally {
      setLoadingResumen(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalCatastro"
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
                {/*Reportes Catastro*/}
              </h5>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                  disabled={loading || loadingResumen || loadingExport}
                  style={{
                    backgroundColor: "#198754",
                    color: "white",
                    border: "none",
                    opacity:
                      loading || loadingResumen || loadingExport ? 0.6 : 1,
                    cursor:
                      loading || loadingResumen || loadingExport
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </button>

                <h5 className="modal-title ms-3 mb-0" id="modalTitleId">
                  Reportes Catastro
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
                  <option value="especifica">Catastro Especifica</option>
                  <option value="resumen_cnae">Resumen por CNEA</option>
                  <option value="resumen_cnae_Precio0">
                    Resumen por CNAE y precio 0
                  </option>
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
                    data-bs-target="#collapseFormCatastro"
                    aria-expanded={resultados.length === 0 ? "true" : "false"}
                    aria-controls="collapseFormCatastro"
                  >
                    {resultados.length === 0
                      ? "Ocultar formulario"
                      : "Formulario de búsqueda"}
                  </button>
                </div>
              )}

              {/* Spinner de carga */}
              {loading && (
                <div className="text-center my-3">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2">Consultando, por favor espera...</p>
                </div>
              )}

              {/* Formulario dentro del collapse */}
              <div
                className={`collapse${resultados.length === 0 ? " show" : ""}`}
                id="collapseFormCatastro"
              >
                {selectedReporte === "especifica" && (
                  <FormCatastro
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
                      disabled={loading || loadingResumen || loadingExport}
                      style={{
                        opacity:
                          loading || loadingResumen || loadingExport ? 0.6 : 1,
                        cursor:
                          loading || loadingResumen || loadingExport
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loadingExport ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faDownload} /> Exportar
                        </>
                      )}
                    </button>
                  </div>
                  <div className="table-responsive m-4 ">
                    <table className="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Interlocutor</th>
                          <th>Cuenta Contrato</th>
                          <th>Nombre Usuario</th>
                          <th>Cedula</th>
                          <th>CNAE</th>
                          <th>Tarifa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayResultados.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.interlocutor}</td>
                            <td>{item.cuentaContrato}</td>
                            <td>{item.nombre}</td>
                            <td>{item.cedula}</td>
                            <td>{item.cnae}</td>
                            <td>{item.tarifa}</td>
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

              {/*spinner carga*/}

              {selectedReporte === "resumen_cnae" && loadingResumen && (
                <div className="text-center my-3">
                  <div className="spinner-border text-success" role="status" />
                  <p className="mt-2">
                    Generando resumen por CNAE, por favor espera...
                  </p>
                </div>
              )}

              {/* Tabla de resumen CNAE */}

              {selectedReporte === "resumen_cnae" && resumenCnae.length > 0 && (
                <>
                  <div className="table-responsive m-4">
                    <Table data={resumenCnae} nombre={"RESUMEN_CNAE.xlsx"} />
                  </div>
                </>
              )}

              {/*spinner carga PRECIO 0*/}
              {selectedReporte === "resumen_cnae_Precio0" && loadingResumen && (
                <div className="text-center my-3">
                  <div className="spinner-border text-success" role="status" />
                  <p className="mt-2">
                    Generando resumen por CNAE y PRECIO 0, por favor espera...
                  </p>
                </div>
              )}

              {selectedReporte === "resumen_cnae_Precio0" &&
                resumenCnae.length > 0 && (
                  <>
                    <div className="table-responsive m-4">
                      <Table
                        data={resumenCnae}
                        nombre={"RESUMEN_CNAE_PRECIO0.xlsx"}
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
