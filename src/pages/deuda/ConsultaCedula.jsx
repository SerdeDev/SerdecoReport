import { useEffect, useState } from "react";
import Dash from "../../components/layouts/Dash";
import Card from "../../components/Card";
import ModalCedulaConsulta from "../../components/modals/ModalCedulaConsulta"; // ✅ nuevo componente
import { Toast } from "bootstrap/dist/js/bootstrap.bundle.min";

export default function ConsultaCedula() {
  const [showModalCedulaConsulta, setShowModalCedulaConsulta] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleCloseModalCedulaConsulta = () => {
    setShowModalCedulaConsulta(false);
  };

  const handleShowToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const toastEl = document.getElementById("liveToastSIGECOM");
      if (toastEl) {
        const toast = new Toast(toastEl);
        toast.show();
        const timeout = setTimeout(() => {
          setShowToast(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [showToast]);

  return (
    <Dash>
      {/* ✅ Usamos el nuevo modal funcional */}
      <ModalCedulaConsulta
        show={showModalCedulaConsulta}
        handleClose={handleCloseModalCedulaConsulta}
        handleShowToast={handleShowToast}
      />

      {/*<div className="container">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <Card
              modalS={() => setShowModalCedulaConsulta(true)}
              reporte={"Consulta Deuda"}
            />
          </div>
        </div>
      </div>*/}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          id="liveToastSIGECOM"
          className="toast"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Notificación</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">{toastMessage}</div>
        </div>
      </div>
    </Dash>
  );
}
