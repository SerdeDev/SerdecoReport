import PropTypes from "prop-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { anticipoSchema } from "../../validations/anticipoSchema";

function FormAnticipos({ onSubmit, defaultValues, handleClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(anticipoSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const getInputClassName = (fieldName) => {
    if (!dirtyFields[fieldName]) {
      return "form-control";
    }
    return `form-control ${errors[fieldName] ? "is-invalid" : "is-valid"}`;
  };

  const onSubmitForm = (data) => {
    console.log("Datos del formulario:", data);

    onSubmit(data, reset);
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row g-3 ">
        <legend className="fs-5">Semana Anticipar</legend>
        <div className="col">
          <div className="form-floating">
            <input
              type="date"
              className={getInputClassName("fechaDesde")}
              id="floatingDate"
              placeholder="fechaDesde"
              {...register("fechaDesde")}
            />
            <label htmlFor="floatingDate">Fecha de Desde</label>
            {errors.fechaDesde?.message && (
              <div className="invalid-feedback">
                {errors.fechaDesde?.message}
              </div>
            )}
          </div>
        </div>
        <div className="col">
          <div className="form-floating">
            <input
              type="date"
              className={getInputClassName("fechaHasta")}
              id="floatingDate"
              placeholder="fechaHasta"
              {...register("fechaHasta")}
            />
            <label htmlFor="floatingDate">Fecha de Hasta</label>
            {errors.fechaHasta?.message && (
              <div className="invalid-feedback">
                {errors.fechaHasta?.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
          onClick={handleClose}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-success">
          Generar
        </button>
      </div>
    </form>
  );
}

FormAnticipos.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FormAnticipos;
