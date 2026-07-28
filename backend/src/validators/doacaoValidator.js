import { TipoBeneficio } from "@prisma/client";
import { z } from "zod";

export const criarDoacaoSchema = z.object({
  beneficiarioId: z.number().int().positive(),

  tipo: z.nativeEnum(TipoBeneficio).default(TipoBeneficio.CESTA),

  quantidade: z.number().int().min(1),

  observacoes: z.string().trim().max(500).optional(),
});