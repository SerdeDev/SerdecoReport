import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { deudaSectorSchema } from "../../validations/deudaSectorSchema"; // ← lo definimos luego

function FormDeudaSector({ onSubmit, defaultValues, handleClose }) {
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const endpoint = "http://10.200.10.249:3001/api";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(deudaSectorSchema),
  });

  useEffect(() => {
    reset(defaultValues);
    fetch(`${endpoint}/operadoras`)
      .then((res) => res.json())
      .then((data) => {
        const estadosUnicos = [...new Set(data.map((d) => d.estado))].map(
          (e) => ({ value: e, label: e })
        );
        setEstados(estadosUnicos);

        const municipiosUnicos = data.map((d) => ({
          municipio: d.municipio,
          estado: d.estado,
        }));
        setMunicipios(municipiosUnicos);
      });
  }, [defaultValues, reset]);

  const municipioOptions = municipios
    .filter(
      (m) =>
        !control._formValues.estado || m.estado === control._formValues.estado
    )
    .map((m) => ({ value: m.municipio, label: m.municipio }));

  return (
    <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
      {/* Estado */}
      <div className="col-4">
        <Controller
          control={control}
          name="estado"
          render={({ field }) => (
            <Select
              {...field}
              options={estados}
              placeholder="Seleccionar Estado"
              isClearable
              onChange={(option) => {
                field.onChange(option?.value || null);
                setValue("municipio", null);
              }}
            />
          )}
        />
        {errors.estado && (
          <div className="invalid-feedback d-block">
            {errors.estado.message}
          </div>
        )}
      </div>

      {/* Municipio */}
      <div className="col-4">
        <Controller
          control={control}
          name="municipio"
          render={({ field }) => (
            <Select
              {...field}
              options={municipioOptions}
              placeholder="Seleccionar Municipio"
              isClearable
              isDisabled={!control._formValues.estado}
              onChange={(option) => field.onChange(option?.value || null)}
            />
          )}
        />
        {errors.municipio && (
          <div className="invalid-feedback d-block">
            {errors.municipio.message}
          </div>
        )}
      </div>

      {/* Sector (CNAE) */}
      <div className="col-4 text-start">
        <legend className="fs-5">Sector</legend>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="residencial"
            {...register("residencial")}
          />
          <label className="form-check-label" htmlFor="residencial">
            Residencial
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="comercial"
            {...register("comercial")}
          />
          <label className="form-check-label" htmlFor="comercial">
            Comercial
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="industrial"
            {...register("industrial")}
          />
          <label className="form-check-label" htmlFor="industrial">
            Industrial
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="nofaturable"
            {...register("nofaturable")}
          />
          <label className="form-check-label" htmlFor="nofaturable">
            No Faturable
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-success">
          Consultar
        </button>
      </div>
    </form>
  );
}

export default FormDeudaSector;
