import { z } from "zod";

const servicios = ["Aseo", "Relleno"];

export const recgSchema = z
  .object({
    interlocutor: z.string().optional().nullable(),
    estado: z.string().optional().nullable(),
    municipio: z.string().optional().nullable(),
    servicio: z.enum(servicios).optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) =>
      !!data.interlocutor ||
      !!data.estado ||
      !!data.municipio ||
      !!data.servicio,
    {
      message: "Debes llenar al menos un campo para generar el reporte.",
      path: ["interlocutor"],
    }
  );
