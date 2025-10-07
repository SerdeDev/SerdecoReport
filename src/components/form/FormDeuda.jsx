import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { deudaSchema } from "../../validations/deudaSchema";

function FormDeuda({ onSubmit, defaultValues, handleClose }) {
  const [municipios, setMunicipios] = useState([]);
  const [interlocutores, setInterlocutores] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);

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
    resolver: zodResolver(deudaSchema),
  });

  useEffect(() => {
    reset(defaultValues);
    fetchData();
  }, [defaultValues, reset]);

  const enpoint = "http://10.200.10.41:3001/api";

  const fetchData = async () => {
    try {
      const response = await fetch(`${enpoint}/operadoras`);
      const data = await response.json();

      // Estados únicos
      const estadosUnicos = [];
      const seenEstados = new Set();
      data.forEach((item) => {
        if (item.estado && !seenEstados.has(item.estado)) {
          seenEstados.add(item.estado);
          estadosUnicos.push({ value: item.estado, label: item.estado });
        }
      });
      setEstados(estadosUnicos);

      // Interlocutores únicos
      const interlocutoresUnicos = [];
      const seenInter = new Set();
      data.forEach((item) => {
        if (item.interlocutor && !seenInter.has(item.interlocutor)) {
          seenInter.add(item.interlocutor);
          interlocutoresUnicos.push({
            value: item.interlocutor,
            label: item.interlocutor,
          });
        }
      });
      setInterlocutores(interlocutoresUnicos);

      // Municipios únicos
      const municipiosUnicos = [];
      const seenMunicipios = new Set();
      data.forEach((item) => {
        if (
          item.municipio &&
          item.estado &&
          !seenMunicipios.has(`${item.estado}-${item.municipio}`)
        ) {
          seenMunicipios.add(`${item.estado}-${item.municipio}`);
          municipiosUnicos.push({
            municipio: item.municipio,
            estado: item.estado,
          });
        }
      });
      setMunicipios(municipiosUnicos);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Opciones para selects
  const estadoOptions = estados;
  const interlocutorOptions = interlocutores;
  const municipioOptions = municipios
    .filter(
      (mun) =>
        !control._formValues.estado || mun.estado === control._formValues.estado
    )
    .reduce((acc, mun) => {
      if (!acc.some((item) => item.municipio === mun.municipio)) {
        acc.push(mun);
      }
      return acc;
    }, [])
    .map((mun) => ({
      value: mun.municipio,
      label: mun.municipio,
    }));

  const getInputClassName = (fieldName) => {
    if (!dirtyFields[fieldName]) {
      return "form-control";
    }
    return `form-control ${errors[fieldName] ? "is-invalid" : "is-valid"}`;
  };

  const onSubmitForm = async (data) => {
    setLoading(true); // desactiva el botón

    try {
      console.log("Datos del formulario:", data);
      if (data.cedula.length > 0 && data.tipoCedula.length > 0) {
        const { tipoCedula, cedula, ...rest } = data;
        const dataConcatenada = {
          ...rest,
          cedula: `${tipoCedula || ""}-${cedula || ""}`,
        };

        await onSubmit(dataConcatenada, reset); // espera que termine
      } else {
        await onSubmit(data, reset);
      }
    } catch (error) {
      console.error("Error al generar:", error);
    } finally {
      setLoading(false); // reactiva el botón
    }
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row g-3">
        <div className="col-4">
          <div className="form-floating">
            <input
              type="text"
              id="cuentaContrato"
              className={getInputClassName("cuentaContrato")}
              placeholder="cuentaContrato"
              aria-label="cuentaContrato"
              {...register("cuentaContrato")}
            />
            <label htmlFor="cuentaContrato">Cuenta Contrato</label>
            {errors.cuentaContrato?.message && (
              <div className="invalid-feedback">
                {errors.cuentaContrato?.message}
              </div>
            )}
          </div>
        </div>
        <div className="col-4">
          <div className="input-group ">
            <select
              className={`form-select flex-grow-0 bg-light ${
                errors.tipocedula ? "is-invalid" : ""
              }`}
              style={{ width: "80px" }}
              aria-label="Tipo de cedula"
              {...register("tipoCedula")}
            >
              <option value="">Tipo</option>
              <option value="V">V</option>
              <option value="E">E</option>
            </select>
            <input
              type="text"
              id="cedula"
              className={getInputClassName("cedula")}
              placeholder="cedula"
              aria-label="cedula"
              {...register("cedula")}
            />
            <label htmlFor="cedula"></label>
            {errors.cedula?.message && (
              <div className="invalid-feedback">{errors.cedula?.message}</div>
            )}
          </div>
        </div>

        {/* Select Estado */}
        <div className="col-4">
          <Controller
            control={control}
            name="interlocutor"
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  options={interlocutorOptions}
                  placeholder="Seleccionar interlocutor"
                  isClearable
                  value={
                    interlocutorOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(
                      selectedOption ? selectedOption.value : null
                    );
                  }}
                />
                {errors.interlocutor && (
                  <div className="invalid-feedback d-block">
                    {errors.interlocutor.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Select Estado */}
        <div className="col-4">
          <Controller
            control={control}
            name="estado"
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
                    setValue("municipio", null);
                  }}
                />
                {errors.estado && (
                  <div className="invalid-feedback d-block">
                    {errors.estado.message}
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
            name="municipio"
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
                  }}
                  isDisabled={!control._formValues.estado}
                />
                {errors.municipio && (
                  <div className="invalid-feedback d-block">
                    {errors.municipio.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>
        <div className="col-4">
          <select
            className={`form-select flex-grow-0 bg-light ${
              errors.servicio ? "is-invalid" : ""
            }`}
            aria-label="servicios"
            {...register("servicio")}
          >
            <option value="">Servicio</option>
            <option value="Aseo">Aseo</option>
            <option value="Relleno">Relleno</option>
          </select>
        </div>
        <div className="col-4 text-start">
          <legend className="fs-5">Tipo de Usuario</legend>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="cnaeResidencial"
              {...register("cnaeResidencial")}
            />
            <label className="form-check-label" htmlFor="cnaeResidencial">
              Residencial
            </label>
          </div>

          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="cnaeComercial"
              {...register("cnaeComercial")}
            />
            <label className="form-check-label" htmlFor="cnaeComercial">
              Comercial
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="cnaeIndustrial"
              {...register("cnaeIndustrial")}
            />
            <label className="form-check-label" htmlFor="cnaeIndustrial">
              Industrial
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id="cnaeNoFaturable"
              {...register("cnaeNoFaturable")}
            />
            <label className="form-check-label" htmlFor="cnaeNoFaturable">
              NoFaturable
            </label>
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
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Generando..." : "Generar"}
        </button>
      </div>
    </form>
  );
}

FormDeuda.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FormDeuda;
