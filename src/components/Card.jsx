import {
  faFileInvoiceDollar,
  faIdCard,
  faMoneyBillTransfer,
  faMoneyBillWheat,
  faPlugCircleCheck,
  faRightToBracket,
  faFileContract,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PropTypes from "prop-types";

export default function Card({ modalS, reporte }) {
  return (
    <>
      <div className="card border-white text-center shadow p-3 mb-5 bg-body-tertiary rounded">
        <div className="card-body">
          <div className="text-center">
            {reporte === "SIGECOM" && (
              <FontAwesomeIcon icon={faPlugCircleCheck} className="fs-1" />
            )}
            {reporte === "CATASTRO" && (
              <FontAwesomeIcon icon={faIdCard} className="fs-1" />
            )}
            {reporte === "DEUDA" && (
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="fs-1" />
            )}
            {reporte === "RECG" && (
              <FontAwesomeIcon icon={faMoneyBillTransfer} className="fs-1" />
            )}
            {reporte === "DEUDA MASIVA" && (
              <FontAwesomeIcon icon={faFileContract} className="fs-1" />
            )}
            {reporte === "ANTICIPOS" && (
              <FontAwesomeIcon icon={faMoneyBillWheat} className="fs-1" />
            )}
          </div>
          <h5 className="card-title">{reporte}</h5>

          <div className="btn-group btn-group-sm mt-2" role="group">
            <button type="button" className="btn btn-success" onClick={modalS}>
              <FontAwesomeIcon icon={faRightToBracket} className="fs-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

Card.propTypes = {
  modalS: PropTypes.object.isRequired,
  reporte: PropTypes.string.isRequired,
};
