import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { recgSchema } from "../../validations/recgSchema";

function FormRECG({ onSubmit, defaultValues, handleClose }) {
  const [municipios, setMunicipios] = useState([]);
  const [interlocutores, setInterlocutores] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  const fetchMesesDisponibles = async () => {
    try {
      const response = await fetch(
        "http://10.200.10.249:3001/api/getRecgMesesDisponibles"
      );
      const data = await response.json();
      setMesesDisponibles(data); // Ejemplo: ["2025-08", "2025-09"]
    } catch (error) {
      console.error("Error al cargar meses disponibles:", error);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(recgSchema),
  });

  useEffect(() => {
    reset(defaultValues);
    fetchData();
    fetchMesesDisponibles();
  }, [defaultValues, reset]);

  const enpoint = "http://10.200.10.249:3001/api";

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
  const estadoSeleccionado = watch("estado");
  const estadoOptions = estados;
  const interlocutorOptions = interlocutores;
  const municipioOptions = municipios
    .filter((mun) => !estadoSeleccionado || mun.estado === estadoSeleccionado)
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

  // 📌 Ajuste aquí: enviar fechas como strings
  const onSubmitForm = async (data) => {
    setLoading(true);

    const payload = { ...data };

    if (mesSeleccionado) {
      const [año, mes] = mesSeleccionado.split("-");
      const fechaInicio = `${año}-${mes}-01`;
      const fechaFin = new Date(año, mes, 1).toISOString().split("T")[0]; // primer día del siguiente mes

      payload.mesSeleccionado = mesSeleccionado;
      payload.fechaInicio = fechaInicio;
      payload.fechaFin = fechaFin;
    }

    try {
      await onSubmit(payload, reset);
    } catch (error) {
      console.error("Error al generar resumen:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row g-3">
        {/* Select Interlocutor */}
        <div className="col-3">
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

        {/* Select Mes */}
        <div className="col-3">
          <select
            className="form-select"
            id="mesSeleccionado"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            <option value="">Seleccione Mes</option>
            {mesesDisponibles.map((mes) => {
              const [year, month] = mes.split("-");
              const nombreMes = new Date(
                Number(year),
                Number(month) - 1
              ).toLocaleDateString("es-VE", {
                month: "long",
                year: "numeric",
              });
              return (
                <option key={mes} value={mes}>
                  {nombreMes}
                </option>
              );
            })}
          </select>
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
                  isDisabled={!estadoSeleccionado}
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

        {/* Select Servicio */}
        <div className="col-3">
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

FormRECG.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FormRECG;
