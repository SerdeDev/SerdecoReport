import { z } from "zod";
const tiposCedula = ["V", "E", "G", "J"];
export const sigecomSchema = z
  .object({
    nombres: z.string().optional(),
    cuentasap: z.string().optional(),
    documento: z.string().optional(),
    tipoCedula: z.enum(tiposCedula).optional().nullable().or(z.literal("")),
    estadoCC: z.string().optional().nullable(),
    municipioCC: z.string().optional().nullable(),
    parroquiaCC: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      !!data.nombres ||
      !!data.cuentasap ||
      !!data.documento ||
      !!data.tipoCedula ||
      !!data.estadoCC ||
      !!data.municipioCC ||
      !!data.parroquiaCC,
    {
      message: "Debes llenar al menos un campo para generar el reporte.",
      path: ["estadoCC"],
    }
  );
