// Importación de librerías necesarias
import PropTypes from "prop-types"; // Validación de tipos de props
import { useEffect, useState } from "react"; // Hooks de estado y ciclo de vida
import { Controller, useForm } from "react-hook-form"; // Manejo de formularios
import Select from "react-select"; // Componente de select personalizado
import { zodResolver } from "@hookform/resolvers/zod"; // Integración de Zod con react-hook-form
import { catastroSchema } from "../../validations/catastroSchema"; // Esquema de validación del formulario

function FormCatastro({ onSubmit, defaultValues, handleClose }) {
  // Estados locales para almacenar datos dinámicos
  const [municipios, setMunicipios] = useState([]);
  const [interlocutores, setInterlocutores] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false); // Estado para controlar el botón de envío

  // Inicialización del formulario con react-hook-form
  const {
    register, // Para inputs simples
    handleSubmit, // Función para manejar el envío
    control, // Controlador para inputs personalizados (Select)
    setValue, // Permite modificar valores del formulario
    formState: { errors, dirtyFields }, // Errores y campos modificados
    reset, // Reinicia el formulario
  } = useForm({
    mode: "onChange", // Valida en cada cambio
    defaultValues, // Valores iniciales
    resolver: zodResolver(catastroSchema), // Validación con Zod
  });

  // Efecto que se ejecuta al montar el componente o cambiar defaultValues
  useEffect(() => {
    reset(defaultValues); // Reinicia el formulario con nuevos valores
    fetchData(); // Carga datos desde el backend
  }, [defaultValues, reset]);

  const enpoint = "http://10.200.10.41:3001/api"; // URL base del backend

  // Función para obtener datos desde el backend
  const fetchData = async () => {
    try {
      const response = await fetch(`${enpoint}/operadoras`);
      const data = await response.json();

      // Filtra estados únicos
      const estadosUnicos = [];
      const seenEstados = new Set();
      data.forEach((item) => {
        if (item.estado && !seenEstados.has(item.estado)) {
          seenEstados.add(item.estado);
          estadosUnicos.push({ value: item.estado, label: item.estado });
        }
      });
      setEstados(estadosUnicos);

      // Filtra interlocutores únicos
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

      // Filtra municipios únicos por estado
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

  // Opciones para los selects
  const estadoOptions = estados;
  const interlocutorOptions = interlocutores;

  // Filtra municipios según el estado seleccionado
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

  // Devuelve clases CSS según si el campo fue modificado y tiene errores
  const getInputClassName = (fieldName) => {
    if (!dirtyFields[fieldName]) {
      return "form-control";
    }
    return `form-control ${errors[fieldName] ? "is-invalid" : "is-valid"}`;
  };

  // Función que maneja el envío del formulario
  const onSubmitForm = async (data) => {
    setLoading(true); // Desactiva el botón

    try {
      console.log("Datos del formulario:", data);

      // Si hay tipo y número de cédula, los concatena
      if (data.cedula.length > 0 && data.tipoCedula.length > 0) {
        const { tipoCedula, cedula, ...rest } = data;
        const dataConcatenada = {
          ...rest,
          cedula: `${tipoCedula || ""}-${cedula || ""}`,
        };

        await onSubmit(dataConcatenada, reset); // Envía los datos
      } else {
        await onSubmit(data, reset);
      }
    } catch (error) {
      console.error("Error al generar:", error);
    } finally {
      setLoading(false); // Reactiva el botón
    }
  };

  // Renderizado del formulario
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

FormCatastro.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default FormCatastro;
