import { exportToExcel } from "../../func/pasarExcel";
import FormSigecom from "../form/FormSigecom";

export default function ModalSigecom({ show, handleClose, handleShowToast }) {
  const defaultValues = {
    documento: "",
    tipoCedula: "", // Valor por defecto
    cuentasap: "",
    estadoCC: null,
    municipioCC: null,
    parroquiaCC: null,
  };

  const onSubmit = async (data, resetForm) => {
    try {
      console.log("Datos enviados:", data);
      const response = await fetch("http://10.200.10.41:3001/api/getSigecom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Datos enviados:", result);
      const fileNameParts = [
        data.documento,
        data.cuentasap,
        data.estadoCC,
        data.municipioCC,
        data.parroquiaCC,
      ]
        .filter(Boolean)
        .join("_");
      exportToExcel(
        result,
        `DATA_SIGECOM${fileNameParts ? "_" + fileNameParts : ""}.xlsx`
      );
      if (!result || result.length === 0) {
        handleShowToast("No se encontraron resultados");
        return;
      }
      handleShowToast("Consulta realizada correctamente");
      handleClose();
      resetForm(defaultValues);
    } catch (error) {
      console.error("Error enviando datos:", error);
      handleShowToast("Error al consultar");
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? "show d-block" : "d-none"}`}
        id="modalSigecom"
        tabIndex="-1"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        role="dialog"
        aria-labelledby="modalTitleId"
        aria-hidden={!show ? "true" : "false"} // <-- Cambia aquí
      >
        <div
          className="modal-dialog modal-dialog-centered modal-xl "
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modalTitleId">
                Reporte SIGECOM
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
              <FormSigecom
                onSubmit={onSubmit}
                defaultValues={defaultValues}
                handleClose={handleClose}
              />
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}
