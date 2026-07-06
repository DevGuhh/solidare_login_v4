import { prisma } from "../config/db.js"
import { ZodError } from "zod"
import {criarBeneficiarioSchema} from "../validators/beneficiarioValidator.js"


const cadastrarBeneficiario = async (req, res) => {
    try {
        const data = criarBeneficiarioSchema.parse(req.body)

        const beneficiarioExiste = await prisma.beneficiario.findUnique({
            where: {cpf: data.cpf},
        })

        if (beneficiarioExiste) {
            return res.status(400).json({
                error: "Beneficiário já existente com este CPF"
            })
        }

        const novoBeneficiario = await prisma.beneficiario.create({
            data: {
                ...data,
                instituicaoId: req.user.instituicaoId
            }
        })

        res.status(201).json({
            mensagem: "Benefiário cadastrado com sucesso!",
            beneficiario: novoBeneficiario
        })
        
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Payload inválido",
                issues: error.issues.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                }))
            })
        }
        
        console.error(`POST /beneficiario error:`, error)
        return res.status(500).json({
            error: 'Erro interno ao criar beneficiário'
         })
    }
}

export {cadastrarBeneficiario}