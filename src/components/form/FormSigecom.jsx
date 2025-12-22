import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { sigecomSchema } from "../../validations/sigecomSchema";

function FormSigecom({ onSubmit, defaultValues, handleClose }) {
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, dirtyFields },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(sigecomSchema),
  });

  useEffect(() => {
    reset(defaultValues);
    fetchEstado();
    fetchMunicipios();
    fetchParroquias();
    // eslint-disable-next-line
  }, [defaultValues, reset]);

  const enpoint = "http://10.200.10.249:3001/api";

  const fetchEstado = async () => {
    try {
      const response = await fetch(`${enpoint}/estados`);
      const fetchedEstados = await response.json();
      const uniqueEstados = [];
      const seen = new Set();
      fetchedEstados.forEach((estado) => {
        if (!seen.has(estado.estadoCC)) {
          seen.add(estado.estadoCC);
          uniqueEstados.push(estado);
        }
      });
      setEstados(uniqueEstados);
      console.log("Estados fetched:", uniqueEstados);
    } catch (error) {
      console.error("Error fetching estados:", error);
    }
  };

  const fetchMunicipios = async () => {
    try {
      const response = await fetch(`${enpoint}/estados`);
      const fetched = await response.json();
      setMunicipios(fetched);
    } catch (error) {
      console.error("Error fetching municipios:", error);
    }
  };

  const fetchParroquias = async () => {
    try {
      const response = await fetch(`${enpoint}/estados`);
      const fetched = await response.json();
      setParroquias(fetched);
    } catch (error) {
      console.error("Error fetching parroquias:", error);
    }
  };

  const estadoOptions = estados.map((estado) => ({
    value: estado.estadoCC,
    label: estado.estadoCC,
  }));

  const municipioOptions = municipios
    .filter(
      (mun) =>
        !control._formValues.estadoCC ||
        mun.estadoCC === control._formValues.estadoCC
    )
    .reduce((acc, mun) => {
      if (!acc.some((item) => item.municipioCC === mun.municipioCC)) {
        acc.push(mun);
      }
      return acc;
    }, [])
    .map((mun) => ({
      value: mun.municipioCC,
      label: mun.municipioCC,
    }));

  const parroquiaOptions = parroquias
    .filter(
      (parr) =>
        !control._formValues.municipioCC ||
        parr.municipioCC === control._formValues.municipioCC
    )
    .reduce((acc, parr) => {
      if (!acc.some((item) => item.parroquiaCC === parr.parroquiaCC)) {
        acc.push(parr);
      }
      return acc;
    }, [])
    .map((parr) => ({
      value: parr.parroquiaCC,
      label: parr.parroquiaCC,
    }));

  const getInputClassName = (fieldName) => {
    if (!dirtyFields[fieldName]) {
      return "form-control";
    }
    return `form-control ${errors[fieldName] ? "is-invalid" : "is-valid"}`;
  };

  const onSubmitForm = (data) => {
    const { tipoCedula, documento, ...rest } = data;
    const dataConcatenada = {
      ...rest,
      documento: `${tipoCedula || ""}${documento || ""}`,
    };
    onSubmit(dataConcatenada, reset);
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row g-3">
        <div className="col-6">
          <div className="input-group">
            <select
              className={`form-select flex-grow-0 bg-light ${
                errors.tipocedula ? "is-invalid" : ""
              }`}
              style={{ width: "90px" }}
              aria-label="Tipo de documento"
              {...register("tipoCedula")}
            >
              <option value="">Tipo</option> {/* <-- Opción vacía */}
              <option value="V">V</option>
              <option value="E">E</option>
            </select>
            <input
              type="text"
              id="documento"
              className={getInputClassName("documento")}
              placeholder="documento"
              aria-label="documento"
              {...register("documento")}
            />
            <label htmlFor="documento"></label>
            {errors.documento?.message && (
              <div className="invalid-feedback">
                {errors.documento?.message}
              </div>
            )}
          </div>
        </div>
        <div className="col-6">
          <div className="form-floating">
            <input
              type="text"
              id="cuentasap"
              className={getInputClassName("cuentasap")}
              placeholder="cuentasap"
              aria-label="cuentasap"
              {...register("cuentasap")}
            />
            <label htmlFor="cuentasap">Cuenta Contrato</label>
            {errors.cuentasap?.message && (
              <div className="invalid-feedback">
                {errors.cuentasap?.message}
              </div>
            )}
          </div>
        </div>

        {/* Select Estado */}
        <div className="col-4">
          <Controller
            control={control}
            name="estadoCC"
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  options={estadoOptions}
                  placeholder="Seleccionar Estado"
                  isClearable
                  value={
                    estadoOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(
                      selectedOption ? selectedOption.value : null
                    );
                    setValue("municipioCC", null);
                    setValue("parroquiaCC", null);
                  }}
                />
                {errors.estadoCC && (
                  <div className="invalid-feedback d-block">
                    {errors.estadoCC.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Select Municipio */}
        <div className="col-4">
          <Controller
            control={control}
            name="municipioCC"
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  options={municipioOptions}
                  placeholder="Seleccionar Municipio"
                  isClearable
                  value={
                    municipioOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(
                      selectedOption ? selectedOption.value : null
                    );
                    setValue("parroquiaCC", null);
                  }}
                  isDisabled={!control._formValues.estadoCC}
                />
                {errors.municipioCC && (
                  <div className="invalid-feedback d-block">
                    {errors.municipioCC.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Select Parroquia */}
        <div className="col-4">
          <Controller
            control={control}
            name="parroquiaCC"
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  options={parroquiaOptions}
                  placeholder="Seleccionar Parroquia"
                  isClearable
                  value={
                    parroquiaOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(
                      selectedOption ? selectedOption.value : null
                    );
                  }}
                  isDisabled={!control._formValues.municipioCC}
                />
                {errors.parroquiaCC && (
                  <div className="invalid-feedback d-block">
                    {errors.parroquiaCC.message}
                  </div>
                )}
              </div>
            )}
          />
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
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}

FormSigecom.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FormSigecom;
