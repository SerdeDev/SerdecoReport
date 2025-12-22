import { z } from "zod";

export const deudaSectorSchema = z.object({
  estado: z.string().min(1, "Estado requerido"),
  municipio: z.string().min(1, "Municipio requerido"),
  residencial: z.boolean().optional(),
  comercial: z.boolean().optional(),
  industrial: z.boolean().optional(),
  nofaturable: z.boolean().optional(),
});
