import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { createPassword } from "../utils/generatePassword.js";
import { criarInstituicaoSchema } from "../validators/instituicaoValidator.js";
import { ZodError } from "zod";
import path from "node:path";
import { da } from "zod/v4/locales";
import { error } from "node:console";
import { Prisma } from "@prisma/client";

class InstituicaoController {
  // Listar
  async index(req, res) {
    const { nome, tipo, cidade, statusOk, ativa, sort } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;

    const where = {};

    if (nome) {
      where.nome = {
        contains: nome,
        mode: "insensitive",
      };
    }

    if (tipo) {
      where.tipo = tipo.toUpperCase();
    }

    if (cidade) {
      where.cidade = {
        contains: cidade,
        mode: "insensitive",
      };
    }

    if (statusOk) {
      where.statusOk = statusOk;
    }

    if (ativa !== undefined) {
      where.ativa = ativa === "true";
    }

    let orderBy = { nome: "asc" };

    if (sort) {
      orderBy = sort.split(",").map((item) => {
        const [campo, direcao] = item.split(":");

        return {
          [campo]: direcao.toLowerCase(),
        };
      });
    }

    try {
      const instituicoes = await prisma.instituicaoParceira.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      });

      return res.status(200).json(instituicoes);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao listar as instituições",
      });
    }
  }

  async show(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID inválido. Use um inteiro positivo",
      });
    }

    try {
      const instituicao = await prisma.instituicaoParceira.findFirst({
        where: { id },
      });

      if (!instituicao) {
        return res.status(404).json({ error: "Instituição não encontrada" });
      }

      return res.status(200).json(instituicao);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar instituição" });
    }
  }

  async create(req, res) {
    try {
      const data = criarInstituicaoSchema.parse(req.body);

      const instituicaoExiste = await prisma.instituicaoParceira.findUnique({
        where: { email: data.email },
      });

      if (instituicaoExiste) {
        return res.status(400).json({
          error: "Instituição já existente com esse email.",
        });
      }
      //NÃO APAGAR ESTE COMENTARIO!!
      // const senhaGerada = createPassword()
      // const senhaHash = await bcrypt.hash(senhaGerada, 10)

      const senhaPadrao = "senac123";
      const senhaHash = await bcrypt.hash(senhaPadrao, 10);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome: data.responsavel,
          email: data.email,
          senhaHash,
          role: "INSTITUICAO",
          instituicao: {
            create: {
              nome: data.nome,
              email: data.email,
              tipo: data.tipo,
              responsavel: data.responsavel,
              telefone: data.telefone,
              endereco: data.endereco,
              cidade: data.cidade,
            },
          },
        },
        include: {
          instituicao: true,
        },
      });

      res.status(201).json({
        mensagem: "Instituição cadastrada com sucesso!",
        email: novoUsuario.email,
        senhaProvisoria: senhaPadrao,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload inválido",
          issues: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      console.error(`POST /instituicao error:`, error);
      return res.status(500).json({
        error: "Erro interno ao criar instituição",
      });
    }
  }

  async update(req, res) {
    const atualizarInstituicaoSchema = criarInstituicaoSchema.partial();

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    try {
      const data = atualizarInstituicaoSchema.parse(req.body);
      const update = await prisma.instituicaoParceira.update({
        where: { id },
        data,
      });
      return res.status(200).json(update);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload inválido",
          issues: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }

      console.error(`PUT /instituicao/${req.params.id} error:`, error);
      return res.status(500).json({
        error: "Erro interno ao atualizar instituição.",
      });
    }
  }

  async updateStatus(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ erro: "ID inválido. Use um inteiro positivo" });
    }

    try {
      const data = atualizarInstituicaoSchema.parse(req.body);
      const { statusOk } = data;

      const valoresValidos = ["OK", "PENDENTE"];
      if (!valoresValidos.includes(statusOk)) {
        return res.status(400).json({
          erro: 'Status deve ser "OK" ou "PENDENTE"',
        });
      }

      const instituicaoParceira = await prisma.instituicaoParceira.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });
      if (!instituicaoParceira) {
        return res.status(404).json({ erro: "Instituição não encontrada" });
      }

      const instituicaoAtualizada = await prisma.instituicaoParceira.update({
        where: { id },
        data: { statusOk },
      });

      res.json(instituicaoAtualizada);
    } catch (error) {
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ erro: "Dados inválidos", detalhes: error.errors });
      }
      console.error(error); // ajuda a ver o erro real no terminal
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  async destroy(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      const instituicao = await prisma.instituicaoParceira.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!instituicao) {
        return res.status(404).json({
          error: "Instituição não encontrada.",
        });
      }

      await prisma.instituicaoParceira.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return res.status(200).json({
        mensagem: "Instituição deletada com sucesso",
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "Instituição não encontrada." });
      }

      console.error(`PUT /instituicao/${req.params.id} error:`, error);
      return res.status(500).json({
        error: "Erro interno ao deletar instituição.",
      });
    }
  }
}

export default new InstituicaoController();
