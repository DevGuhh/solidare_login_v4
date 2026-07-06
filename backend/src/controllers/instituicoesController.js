import { prisma } from "../config/db.js"
import bcrypt from "bcrypt"
import {generateToken} from '../utils/generateToken.js'
import {createPassword} from '../utils/generatePassword.js'
import {criarInstituicaoSchema} from '../validators/instituicaoValidator.js'
import { number, ZodError } from "zod"
import path from "node:path"
import { da } from "zod/v4/locales"
import { error } from "node:console"
import { Prisma } from "@prisma/client"

const cadastrarInstituicao = async (req, res) => {
    try {
        const data = criarInstituicaoSchema.parse(req.body) 

        const instituicaoExiste = await prisma.instituicaoParceira.findUnique({
            where: {email: data.email},
        })

        if (instituicaoExiste) {
            return res.status(400).json({
                error: "Instituição já existente com esse email."
            })
        }

        const senhaGerada = createPassword()

        const senhaHash = await bcrypt.hash(senhaGerada, 10)

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: data.responsavel,
                email: data.email,
                senhaHash,
                role: 'INSTITUICAO',
                instituicao: {
                    create: {
                        nome: data.nome,
                        email: data.email,
                        tipo: data.tipo,
                        responsavel: data.responsavel,
                        telefone: data.telefone,
                        endereco: data.endereco,
                        cidade: data.cidade,
                    }
                }
            },
            include: {
                instituicao: true
            }
        })

        res.status(201).json({
            mensagem: "Instituição cadastrada com sucesso!",
            email: novoUsuario.email,
            senhaProvisoria: senhaGerada
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

        console.error(`POST /instituicao error:`, error)
        return res.status(500).json({
            error: 'Erro interno ao criar instituição'
        })
    }
    
}

const listarInstituicoes = async (req, res) => {
    try {
        const instituicoes = await prisma.instituicaoParceira.findMany()
        return res.status(200).json(instituicoes)
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar as instituições'})
    }
}

const detalheDaInstituicao = async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID inválido. Use um inteiro positivo'
        })
    }

    try {
        const instituicao = await prisma.instituicaoParceira.findUnique({ where: {id}})

        if (!instituicao) {
            return res.status(404).json({ error: 'Instituição não encontrada'})
        }

        return res.status(200).json(instituicao)
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar instituição'})
    }
}

const atualizarInstituicaoSchema = criarInstituicaoSchema.partial()

const atualizarDadosInstituicao = async (req, res) => {
    const id = Number(req.params.id)
    if (!number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID inválido. Use um inteiro positivo'
        })
    }

    try {
        const data = atualizarInstituicaoSchema.parse(req.body)
        const update = await prisma.instituicaoParceira.update({where: { id }, data })
        return res.status(200).json(update)
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
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Instituição não encontrada.'})
        }

        console.error(`PUT /instituicao/${req.params.id} error:`, error)
        return res.status(500).json({
            error: 'Erro interno ao atualizar instituição.'
        })
    }
}

const removeInstituicao = async (req, res) => {
    const id = Number(req.params.id) 
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido. Use um inteiro positivo'})
    }

    try {
        await prisma.instituicaoParceira.delete({ where: { id }})
        return res.status(204).json({
            mensagem: "Instituição deletada com sucesso!"
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Instituição não encontrada.'})
        }

        console.error(`PUT /instituicao/${req.params.id} error:`, error)
        return res.status(500).json({
            error: 'Erro interno ao deletar instituição.'
        })
    }
}

const atualizaStatus = async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido. Use um inteiro positivo' })
    }

    try {
        const data = atualizarInstituicaoSchema.parse(req.body)
        const { statusOk } = data

        const valoresValidos = ['OK', 'PENDENTE']
        if (!valoresValidos.includes(statusOk)) {
            return res.status(400).json({
                erro: 'Status deve ser "OK" ou "PENDENTE"'
            })
        }

        const instituicaoParceira = await prisma.instituicaoParceira.findUnique({
            where: { id }
        })
        if (!instituicaoParceira) {
            return res.status(404).json({ erro: 'Instituição não encontrada' })
        }

        const instituicaoAtualizada = await prisma.instituicaoParceira.update({
            where: { id },
            data: { statusOk }
        })

        res.json(instituicaoAtualizada)

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors })
        }
        console.error(error) // ajuda a ver o erro real no terminal
        res.status(500).json({ erro: 'Erro interno do servidor' })
    }
}

// GET `/instituicoes/:id/beneficiarios`

const listarBeneficiariosInstituicao = async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido. Use um inteiro positivo' })
    }
}

export {cadastrarInstituicao, listarInstituicoes, detalheDaInstituicao, atualizarDadosInstituicao, removeInstituicao, atualizaStatus}