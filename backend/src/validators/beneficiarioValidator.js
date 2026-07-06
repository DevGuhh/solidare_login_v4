import { z } from "zod";

export const criarBeneficiarioSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3)
    .max(150),

  cpf: z
    .string()
    .regex(/^\d{11}$/),

  dataNascimento: z.coerce.date(),

  logradouro: z
    .string()
    .trim()
    .min(3)
    .max(150),

  numero: z
    .string()
    .trim()
    .min(1)
    .max(10),

  complemento: z
    .string()
    .max(100)
    .optional(),

  cep: z
    .string()
    .regex(/^\d{8}$/)
    .optional(),

  regiao: z
    .string()
    .trim()
    .min(2)
    .max(100),

  cidade: z
    .string()
    .trim()
    .min(2)
    .max(100),

  uf: z.enum([
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
    "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
    "SP","SE","TO"
  ]),

  telefonePrincipal: z
    .string()
    .regex(/^\d{10,11}$/),

  telefoneSecundario: z
    .string()
    .regex(/^\d{10,11}$/)
    .optional(),

  email: z
    .string()
    .email()
    .optional(),

  situacaoSocioeconomica: z
    .string()
    .max(500)
    .optional(),

  observacoes: z
    .string()
    .max(1000)
    .optional()
});