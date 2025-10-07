import { z } from "zod";

export const anticipoSchema = z.object({
  fechaDesde: z
    .string()
    .min(1, { message: "Ingresa tu fecha de inicio de semana anticipar" })
    .date(),
  fechaHasta: z
    .string()
    .min(1, { message: "Ingresa tu fecha de fin de semana anticipar" })
    .date(),
});
