import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { exportToExcel } from "../func/pasarExcel";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";

export default function Table({ data, nombre }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Puedes ajustar este valor

  if (!data || data.length === 0) return <p>No hay datos</p>;

  // Obtener las columnas dinámicamente
  const columns = Object.keys(data[0]);

  // Calcular los datos a mostrar en la página actual
  const offset = currentPage * itemsPerPage;
  const currentData = data.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <>
      <div className="d-grid gap-2 d-md-flex">
        <button
          className="btn btn-success"
          onClick={() => exportToExcel(data, nombre)}
        >
          <FontAwesomeIcon icon={faDownload} />
        </button>
      </div>
      <table className="table table-sm table-hover align-middle">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col}>{item[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={"Anterior"}
        nextLabel={"Siguiente"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination justify-content-center"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
        forcePage={currentPage}
      />
    </>
  );
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  nombre: PropTypes.string.isRequired,
};
