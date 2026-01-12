import { faHouseCircleCheck, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fondoHome from "../../assets/img/report-analysis-5-79.png";
import Dash from "../../components/layouts/Dash";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

function Home() {
  const { auth, logout } = useContext(AuthContext);
  const role = auth?.role;
  const fullName = `${auth?.name ?? ""} ${auth?.surname ?? ""}`;


  const renderMessage = () => {
    switch (role) {
      case "Comercial":
        return "Bienvenido al área Comercial. Aquí podrás gestionar deudas, contratos y reportes de compensación.";
      case "Recaudacion":
        return "Bienvenido al área de Recaudación. Aquí podrás monitorear pagos, deudas y reportes de compensación.";
      case "Tecnologia":
        return "Bienvenido al área de Tecnología. Tienes acceso a todos los módulos.";
      default:
        return "Tu gerencia no tiene acceso a este módulo.";
    }
  };

  return (
    <Dash>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="card border-0 text-body">
          <div className="card-body">
            <FontAwesomeIcon icon={faHouseCircleCheck} className="fs-4 me-3" />
            Te damos la Bienvenida, <strong>{fullName}</strong>
          </div>
        </div>
<button className="logout-btn" onClick={logout}>
  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
  Cerrar Sesión
</button>
      </div>

      <div className="container h-75">
        <div className="row align-items-center h-100">
          <div className="col-md-6 h-100 d-flex align-items-center">
            <p className="text-start text-body fs-1 h-100 d-flex align-items-center ms-3">
              {renderMessage()}
            </p>
          </div>
          <div className="col-md-6 h-75">
            <img src={fondoHome} alt="fondoHome" className="img-fluid h-100" />
          </div>
        </div>
      </div>
    </Dash>
  );
}

export default Home;
