import { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faIdCardClip,
  faWallet,
  faMoneyBill,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import "../../assets/css/dash.css";
import { AuthContext } from "../../context/AuthContext";

function Sidebar({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { auth } = useContext(AuthContext);
  const role = auth?.role?.toLowerCase(); // 👈 normalizamos a minúsculas

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const isDeudaActive =
    location.pathname === "/DeudaConsulta" ||
    location.pathname === "/CedulaConsulta" ||
    location.pathname === "/DeudaCorpoelec";

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div
          className={`sidebar col-auto col-md-${
            isCollapsed ? "1" : "3"
          } col-lg-${isCollapsed ? "1" : "3"} min-vh-100`}
        >
          <div className="p-2">
            <div className="d-flex justify-content-between align-items-center">
              <button
                onClick={toggleSidebar}
                className="sidebar-toggle btn btn-light btn-sm mt-4"
              >
                <FontAwesomeIcon
                  icon={isCollapsed ? faChevronRight : faChevronLeft}
                  size="lg"
                />
              </button>
            </div>

            <ul className="nav nav-pills flex-column mt-4">
              {/* Home → accesible para todos */}
              <li className="nav-item">
                <NavLink
                  to="/Home"
                  className={({ isActive }) =>
                    `nav-link ${
                      isActive ? "active-link" : "inactive-link"
                    }`
                  }
                >
                  <FontAwesomeIcon icon={faHouse} className="fs-5 me-2" />
                  {!isCollapsed && <span className="fs-5">Home</span>}
                </NavLink>
              </li>

              {/* Comercial → roles: comercial, tecnologia */}
              {(role === "comercial" || role === "tecnologia") && (
                <li className="nav-item">
                  <NavLink
                    to="/Comercial"
                    className={({ isActive }) =>
                      `nav-link ${
                        isActive ? "active-link" : "inactive-link"
                      }`
                    }
                  >
                    <FontAwesomeIcon icon={faIdCardClip} className="fs-5 me-2" />
                    {!isCollapsed && <span className="fs-5">Comercial</span>}
                  </NavLink>
                </li>
              )}

              {/* Recaudación → roles: recaudacion, tecnologia */}
              {(role === "recaudacion" || role === "tecnologia") && (
                <li className="nav-item">
                  <NavLink
                    to="/Recaudacion"
                    className={({ isActive }) =>
                      `nav-link ${
                        isActive ? "active-link" : "inactive-link"
                      }`
                    }
                  >
                    <FontAwesomeIcon icon={faMoneyBill} className="fs-5 me-2" />
                    {!isCollapsed && <span className="fs-5">Recaudación</span>}
                  </NavLink>
                </li>
              )}

              {/* Deuda → roles: comercial, recaudacion, tecnologia */}
              {(role === "comercial" ||
                role === "recaudacion" ||
                role === "tecnologia") && (
                <li className="nav-item dropdown">
                  <div
                    className={`nav-link dropdown-toggle ${
                      isDeudaActive ? "active-link" : "inactive-link"
                    }`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="true"
                  >
                    <FontAwesomeIcon icon={faWallet} className="fs-5 me-2" />
                    {!isCollapsed && <span className="fs-5">Consulta Deuda</span>}
                  </div>
                  <ul
                    className={`dropdown-menu ${
                      isDeudaActive ? "show" : ""
                    }`}
                    aria-labelledby="deudaDropdown"
                    data-bs-auto-close="false"
                  >
                    <li>
                      <NavLink
                        to="/DeudaConsulta"
                        className={({ isActive }) =>
                          `dropdown-item ${
                            isActive ? "active-link" : "inactive-link"
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
                          `dropdown-item ${
                            isActive ? "active-link" : "inactive-link"
                          }`
                        }
                      >
                        Cédula ó RIF
                      </NavLink>
                    </li>
                  </ul>
                </li>
              )}
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
