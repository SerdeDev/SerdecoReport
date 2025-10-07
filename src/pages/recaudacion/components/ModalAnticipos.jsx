import { useState } from "react";
import { exportToExcel } from "../../../func/pasarExcel";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Table from "../../../components/Table";
import * as XLSX from "xlsx";
import FormAnticipos from "../../../components/form/FormAnticipos";

function FechaFormateada({ fechaISO }) {
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const opciones = { day: "2-digit", month: "long", year: "numeric" };
    return fecha.toLocaleDateString("es-VE", opciones);
  };

  return <p>{formatearFecha(fechaISO)}</p>;
}

function parseEuropeanNumber(value) {
  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(",", ".").trim();
    return parseFloat(normalized);
  }
  return typeof value === "number" ? value : 0;
}

export default function ModalAnticipos({ show, handleClose, handleShowToast }) {
  const [selectedReporte, setSelectedReporte] = useState("");
  const defaultValues = {
    fechaDesde: "",
    fechaHasta: "",
  };
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState([]);

  const [datosAnticipo, setDatosAnticipo] = useState("");
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const resultadosPorPagina = 10;
  const endpoint = "http://10.200.10.41:3001/api";

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

  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });
      console.log("Datos del archivo:", jsonData);
      setData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  function asignarFechas(data) {
    let currentDate = null;

    return data.map((row) => {
      // Detectar si esta fila contiene una nueva fecha
      if (
        row["__EMPTY_1"] === "Cobros Estimados del día" &&
        typeof row["__EMPTY_3"] === "string"
      ) {
        currentDate = row["__EMPTY_3"].trim(); // Actualizar la fecha actual
      }

      // Agregar la fecha actual al registro
      return {
        ...row,
        fecha: currentDate,
      };
    });
  }

  async function handleSendToBackend() {
    // Primero filtras los datos
    const dataConFechas = asignarFechas(data);
    const cleanData = dataConFechas.filter((row) => {
      const campo1 = Number(row["__EMPTY_1"]);
      const nombre = row["__EMPTY_2"];
      const servicio = row["__EMPTY_4"];
      const total = row["__EMPTY_34"];

      // Solo incluir si __EMPTY_1 es un número válido y hay nombre y servicio
      return (
        !isNaN(campo1) &&
        typeof nombre === "string" &&
        typeof servicio === "string" &&
        typeof total === "string"
      );
    });

    console.log("Datos limpios:", cleanData);

    const transformedData = cleanData.map((row) => ({
      interlocutor: row["__EMPTY_1"].trim(),
      nombreOperadora: row["__EMPTY_2"].toString(),
      servicio: row["__EMPTY_4"].trim(),
      total: parseEuropeanNumber(row["__EMPTY_34"]) || 0,
      fecha: row.fecha,
    }));

    console.log("Datos transformados:", transformedData);

    const datosRecibidos = await fetch(`${endpoint}/updateRecaudacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    });
    if (datosRecibidos) {
      handleShowToast("Recaudación enviada correctamente");
    } else {
      handleShowToast("Error al enviar los datos");
      return;
    }
  }

  const onSubmit = async (data) => {
    console.log("Datos enviados:", data);
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}/getAnticipos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Resultados de la consulta:", result);
      setResultados(result);
      setDatosAnticipo(data);
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

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalAnticipo"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="modalTitleId"
        aria-hidden={!show ? "true" : "false"}
      >
        <div
          className="modal-dialog  modal-dialog-centered modal-xl"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitleId">
                Anticipos a Operadoras
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="col form-floating m-4">
                <select
                  className="form-control"
                  id="floatingConsultaType"
                  aria-label="Seleccione Reporte"
                  value={selectedReporte}
                  onChange={handleReporteChange}
                >
                  <option value="">Seleccione</option>
                  <option value="subir">Subir Recaudacion de la Semana</option>
                  <option value="anticipo">Anticipos de la semana</option>
                  <option value="especifica">Anticipos especifico</option>
                  {/* Agrega más opciones según tus reportes */}
                </select>
                <label className="z-0" htmlFor="floatingConsultaType">
                  Procesos
                </label>
              </div>
              {selectedReporte === "anticipo" && selectedReporte.length > 0 && (
                <FormAnticipos
                  onSubmit={onSubmit}
                  defaultValues={defaultValues}
                  handleClose={handleClose}
                />
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
              <div
                className={`collapse${resultados.length === 0 ? " show" : ""}`}
                id="collapseFormDeuda"
              >
                {selectedReporte === "subir" && (
                  <>
                    <legend className="fs-5 ">Subir Recaudacion</legend>
                    <div className="row g-2 p-3 border rounded shadow-sm">
                      <div className="col-6 mb-3 ms-3 ">
                        <input
                          className="form-control"
                          type="file"
                          accept=".xls,.xlsx"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-primary"
                          onClick={handleSendToBackend}
                        >
                          Subir
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tabla de resultados */}
              {resultados && resultados.length > 0 && (
                <>
                  <div className="d-grid gap-2 d-md-flex">
                    <button className="btn btn-success" disabled={loading}>
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                  <div className="table-responsive m-4 ">
                    <table className="table table-sm table-hover align-middle">
                      <thead>
                        <tr>
                          <th>OPERADORA</th>
                          <th>Operadora Municipio</th>
                          <th>Servicio</th>
                          <th>Total</th>
                          <th>Total 85%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayResultados.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.operadoraGrup}</td>
                            <td>{item.operadoramun}</td>
                            <td>{item.servicio}</td>
                            <td>{item.total_municipio}</td>
                            <td>{item.total_85}</td>
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
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
