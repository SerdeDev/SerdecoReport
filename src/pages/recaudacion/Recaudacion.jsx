import { useEffect, useState } from "react";
import Dash from "../../components/layouts/Dash";
import Card from "../../components/Card";
import ModalSigecom from "../../components/modals/ModalSigecom";
import { Toast } from "bootstrap/dist/js/bootstrap.bundle.min";
import ModalCatastro from "../../components/modals/ModalCatastro";
import ModalDeuda from "../../components/modals/ModalDeuda";
import ModalRECG from "../../components/modals/ModalRECG";
import ModalAnticipos from "./components/ModalAnticipos";

export default function Recaudacion() {
  const [showModalSigecom, setShowModalSigecom] = useState(false);
  const [showModalCatastro, setShowModalCatastro] = useState(false);
  const [showModalDeuda, setShowModalDeuda] = useState(false);
  const [showModalRECG, setShowModalRECG] = useState(false);
  const [showModalAnticipo, setShowModalAnticipo] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleCloseModal = () => {
    setShowModalSigecom(false);
  };

  const handleCloseModalCatastro = () => {
    setShowModalCatastro(false);
  };
  const handleCloseModalDeuda = () => {
    setShowModalDeuda(false);
  };

  const handleCloseModalRECG = () => {
    setShowModalRECG(false);
  };
  const handleCloseModalAnticipo = () => {
    setShowModalAnticipo(false);
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
      <ModalSigecom
        show={showModalSigecom}
        handleClose={handleCloseModal}
        handleShowToast={handleShowToast}
      />
      <ModalCatastro
        show={showModalCatastro}
        handleClose={handleCloseModalCatastro}
        handleShowToast={handleShowToast}
        estatus={{ estatusRecau: true }}
      />
      {/*<ModalDeuda
        show={showModalDeuda}
        handleClose={handleCloseModalDeuda}
        handleShowToast={handleShowToast}
        estatus={{ estatusRecau: true }}
      />*/}
      <ModalRECG
        show={showModalRECG}
        handleClose={handleCloseModalRECG}
        handleShowToast={handleShowToast}
        estatus={{ estatusRecau: true }}
      />
      <ModalAnticipos
        show={showModalAnticipo}
        handleClose={handleCloseModalAnticipo}
        handleShowToast={handleShowToast}
      />

      <div className="d-flex justify-content-between align-items-center">
        <h5 className="card-title fs-3">Recaudación</h5>
      </div>
      <div className="container">
        <div className="mb-3 mt-3" style={{ height: "58px" }}></div>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {/* <div className="col">
            <Card
              modalS={() => setShowModalAnticipo(true)}
              reporte={"ANTICIPOS"}
            />
          </div>
        <div className="col">
            <Card
              modalS={() => setShowModalSigecom(true)}
              reporte={"SIGECOM"}
            />
          </div>*/}
          <div className="col">
            <Card
              modalS={() => setShowModalCatastro(true)}
              reporte={"CATASTRO"}
            />
          </div>
          {/*<div className="col">
            <Card modalS={() => setShowModalDeuda(true)} reporte={"DEUDA"} />
          </div>*/}
          <div className="col">
            <Card modalS={() => setShowModalRECG(true)} reporte={"RECG"} />
          </div>
        </div>
      </div>
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
