import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faIdCardClip,
  faWallet,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";

import "../../assets/css/dash.css";
import serdecoIcon from "../../assets/img/logoserdeco.png";
import expandImg from "../../assets/img/circle-chevron-left-solid.png";
import collapseImg from "../../assets/img/circle-chevron-right-solid.png";

function Sidebar({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isDeudaActive =
    location.pathname === "/DeudaConsulta" ||
    location.pathname === "/CedulaConsulta";

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div
          className={`bg-success col-auto col-md-${
            isCollapsed ? "1" : "3"
          } col-lg-${isCollapsed ? "1" : "3"} min-vh-100 borde-content`}
        >
          <div className="bg-success p-2 borde-content">
            <div className="d-flex justify-content-between align-items-center">
              <button
                onClick={toggleSidebar}
                className="btn btn-light btn-sm mt-5"
              >
                <img
                  src={isCollapsed ? collapseImg : expandImg}
                  alt={isCollapsed ? "Expand" : "Collapse"}
                  width="20"
                  height="20"
                />
              </button>
            </div>

            <ul className="nav nav-pills flex-column mt-5">
              {/* Home */}
              <li className="nav-item">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link text-decoration-none ${
                      isActive ? "active bg-warning text-success" : "text-white"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faHouse} className="fs-5 me-2" />
                  {!isCollapsed && (
                    <span className="fs-5 d-none d-sm-inline">Home</span>
                  )}
                </NavLink>
              </li>

              {/* Comercial */}
              <li className="nav-item">
                <NavLink
                  to="/Comercial"
                  className={({ isActive }) =>
                    `nav-link text-decoration-none ${
                      isActive ? "active bg-warning text-success" : "text-white"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faIdCardClip} className="fs-5 me-2" />
                  {!isCollapsed && (
                    <span className="fs-5 d-none d-sm-inline">Comercial</span>
                  )}
                </NavLink>
              </li>

              {/* Recaudacion */}
              <li className="nav-item">
                <NavLink
                  to="/Recaudacion"
                  className={({ isActive }) =>
                    `nav-link text-decoration-none ${
                      isActive ? "active bg-warning text-success" : "text-white"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faMoneyBill} className="fs-5 me-2" />
                  {!isCollapsed && (
                    <span className="fs-5 d-none d-sm-inline">Recaudación</span>
                  )}
                </NavLink>
              </li>

              {/* Deuda (dropdown) */}
              <li className="nav-item dropdown">
                <div
                  className={`nav-link dropdown-toggle text-decoration-none ${
                    isDeudaActive
                      ? "active bg-warning text-success"
                      : "text-white"
                  }`}
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="true"
                >
                  <FontAwesomeIcon icon={faWallet} className="fs-5 me-2" />
                  {!isCollapsed && (
                    <span className="fs-5 d-none d-sm-inline">
                      Consulta Deuda
                    </span>
                  )}
                </div>
                <ul
                  className={`dropdown-menu bg-success border-0 ${
                    isDeudaActive ? "show" : ""
                  }`}
                  aria-labelledby="deudaDropdown"
                  data-bs-auto-close="false"
                  style={{ textAlign: "center" }}
                >
                  <li>
                    <NavLink
                      to="/DeudaConsulta"
                      className={({ isActive }) =>
                        `dropdown-item text-decoration-none ${
                          isActive
                            ? "active bg-warning text-success"
                            : "text-white"
                        }`
                      }
                    >
                      Cuenta Contrato
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/CedulaConsulta"
                      className={({ isActive }) =>
                        `dropdown-item text-decoration-none ${
                          isActive
                            ? "active bg-warning text-success"
                            : "text-white"
                        }`
                      }
                    >
                      Cédula ó RIF
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`col p-3 ${
            isCollapsed ? "col-md-11 col-lg-11" : "col-md-9 col-lg-9"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Sidebar;
