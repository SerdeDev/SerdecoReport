import { z } from "zod";
const tiposCedula = ["V", "E", "G", "J"];
const servicios = ["Aseo", "Relleno"];
export const catastroSchema = z
  .object({
    interlocutor: z.string().optional(),
    cuentaContrato: z.string().optional(),
    cedula: z.string().optional(),
    tipoCedula: z.enum(tiposCedula).optional().nullable().or(z.literal("")),
    estado: z.string().optional().nullable(),
    municipio: z.string().optional().nullable(),
    servicio: z.enum(servicios).optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) =>
      !!data.interlocutor ||
      !!data.cuentaContrato ||
      !!data.cedula ||
      !!data.tipoCedula ||
      !!data.estado ||
      !!data.municipio ||
      !!data.servicio,
    {
      message: "Debes llenar al menos un campo para generar el reporte.",
      path: ["estado"],
    }
  );
