import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

export default function ModalDeudaMasiva({ show, handleClose }) {
  const goToLink = () => {
    window.open("http://10.200.10.40:8080", "_blank");
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalDeudaMasiva"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="modalTitleId"
        aria-hidden={!show ? "true" : "false"}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center">
              <button
                type="button"
                className="btn"
                onClick={handleClose}
                aria-label="Cerrar"
                style={{
                  backgroundColor: "#198754",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
              </button>
            </div>

            <div className="modal-body text-center">
              <button className="btn btn-primary mt-3" onClick={goToLink}>
                <FontAwesomeIcon icon={faDownload} /> Deuda Masiva
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
