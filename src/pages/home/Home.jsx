import { faHouseCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fondoHome from "../../assets/img/report-analysis-5-79.png";
import Dash from "../../components/layouts/Dash";

function Home() {
  return (
    <Dash>
      <div className="card border-0 text-body">
        <div className="card-body ">
          <FontAwesomeIcon icon={faHouseCircleCheck} className="fs-4 me-3" />
          Te damos la Bienvenida:
        </div>
      </div>
      <div className="container h-75">
        <div className="row align-items-center h-100">
          <div className="col-md-6 h-100 d-flex align-items-center">
            <p className="text-start text-body fs-1 h-100 d-flex align-items-center ms-3">
              Aquí podrás registrar, monitorear y gestionar información de
              manera eficiente. Tu colaboración es clave para mejorar procesos y
              encontrar soluciones.
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
