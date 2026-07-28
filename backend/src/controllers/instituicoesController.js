import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { createPassword } from "../utils/generatePassword.js";
import { criarInstituicaoSchema } from "../validators/instituicaoValidator.js";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

/**
 * Valida se o ID recebido pela rota é um número inteiro positivo.
 */
function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

/**
 * Monta os filtros utilizados na listagem de instituições.
 */
function montarFiltrosInstituicoes(query) {
  const { nome, tipo, cidade, statusOk, ativa } = query;

  const where = {
    deletedAt: null,
  };

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
    where.statusOk = statusOk.toUpperCase();
  }

  if (ativa !== undefined) {
    where.ativa = ativa === "true";
  }

  return where;
}

/**
 * Monta a ordenação recebida pela URL.
 *
 * Exemplo:
 * ?sort=nome:asc,cidade:desc
 */
function montarOrdenacao(sort) {
  if (!sort) {
    return {
      nome: "asc",
    };
  }

  const camposPermitidos = [
    "id",
    "nome",
    "email",
    "tipo",
    "responsavel",
    "cidade",
    "statusOk",
    "ativa",
    "createdAt",
  ];

  const ordenacoes = sort
    .split(",")
    .map((item) => {
      const [campo, direcao] = item.split(":");

      if (!camposPermitidos.includes(campo)) {
        return null;
      }

      const direcaoNormalizada =
        direcao?.toLowerCase() === "desc" ? "desc" : "asc";

      return {
        [campo]: direcaoNormalizada,
      };
    })
    .filter(Boolean);

  return ordenacoes.length > 0
    ? ordenacoes
    : {
        nome: "asc",
      };
}

/* =========================================================
   LISTAR INSTITUIÇÕES
========================================================= */

const listarInstituicoes = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 25, 1),
      100,
    );

    const where = montarFiltrosInstituicoes(req.query);
    const orderBy = montarOrdenacao(req.query.sort);

    const [instituicoes, total] = await prisma.$transaction([
      prisma.instituicaoParceira.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),

      prisma.instituicaoParceira.count({
        where,
      }),
    ]);

    return res.status(200).json({
      dados: instituicoes,
      paginacao: {
        paginaAtual: page,
        quantidadePorPagina: limit,
        totalRegistros: total,
        totalPaginas: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /instituicoes error:", error);

    return res.status(500).json({
      error: "Erro interno ao listar as instituições.",
    });
  }
};

/* =========================================================
   CADASTRAR INSTITUIÇÃO
========================================================= */

const cadastrarInstituicao = async (req, res) => {
  try {
    // Valida os dados recebidos pelo formulário.
    const data = criarInstituicaoSchema.parse(req.body);

    const emailNormalizado = data.email.trim().toLowerCase();

    /*
     * Verifica o usuário porque o e-mail será utilizado para login.
     * Isso impede que uma instituição seja cadastrada com o mesmo
     * e-mail de outro usuário do sistema.
     */
    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        error: "Já existe um usuário cadastrado com esse e-mail.",
      });
    }

    /*
     * Gera uma senha temporária aleatória.
     *
     * A senha em texto é utilizada somente nesta operação para:
     * 1. gerar o hash;
     * 2. ser devolvida ao administrador.
     *
     * Somente o hash será salvo no banco de dados.
     */
    const senhaGerada = createPassword();

    if (
      typeof senhaGerada !== "string" ||
      senhaGerada.trim().length < 8
    ) {
      console.error(
        "A função createPassword não gerou uma senha válida.",
      );

      return res.status(500).json({
        error: "Não foi possível gerar a senha temporária.",
      });
    }

    const senhaHash = await bcrypt.hash(senhaGerada, 12);

    /*
     * Cria o usuário e a instituição na mesma operação.
     * Caso alguma criação falhe, nenhuma delas será salva.
     */
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: data.responsavel.trim(),
        email: emailNormalizado,
        senhaHash,

        // A instituição precisará trocar a senha no primeiro acesso
        senhaProvisoria: true,

        role: "INSTITUICAO",

        instituicao: {
          create: {
            nome: data.nome.trim(),
            email: emailNormalizado,
            tipo: data.tipo,
            responsavel: data.responsavel.trim(),
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

    /*
     * Evita que navegadores ou proxies guardem a resposta contendo
     * a senha temporária.
     */
    res.setHeader("Cache-Control", "no-store");

    /*
     * A senha temporária é devolvida apenas nesta resposta.
     * Depois que o modal for fechado, ela não poderá ser recuperada
     * a partir do hash salvo no banco.
     */
    return res.status(201).json({
      mensagem: "Instituição cadastrada com sucesso!",
      credenciais: {
        email: novoUsuario.email,
        senhaTemporaria: senhaGerada,
      },
      instituicao: novoUsuario.instituicao,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Dados inválidos.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    /*
     * P2002 representa violação de campo único no Prisma.
     * Pode acontecer caso dois cadastros sejam enviados quase
     * simultaneamente com o mesmo e-mail.
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "Já existe um cadastro utilizando esse e-mail.",
      });
    }

    console.error("POST /instituicoes error:", error);

    return res.status(500).json({
      error: "Erro interno ao cadastrar a instituição.",
    });
  }
};

/* =========================================================
   DETALHES DA INSTITUIÇÃO
========================================================= */

const detalheDaInstituicao = async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      error: "ID inválido. Informe um número inteiro positivo.",
    });
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

    return res.status(200).json(instituicao);
  } catch (error) {
    console.error(`GET /instituicoes/${id} error:`, error);

    return res.status(500).json({
      error: "Erro interno ao buscar a instituição.",
    });
  }
};

/* =========================================================
   ATUALIZAR INSTITUIÇÃO
========================================================= */

const atualizarInstituicaoSchema =
  criarInstituicaoSchema.partial();

const atualizarDadosInstituicao = async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      error: "ID inválido. Informe um número inteiro positivo.",
    });
  }

  try {
    const data = atualizarInstituicaoSchema.parse(req.body);

    const instituicaoExistente =
      await prisma.instituicaoParceira.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!instituicaoExistente) {
      return res.status(404).json({
        error: "Instituição não encontrada.",
      });
    }

    const dadosAtualizacao = {
      ...data,
    };

    if (data.email) {
      dadosAtualizacao.email = data.email.trim().toLowerCase();
    }

    if (data.nome) {
      dadosAtualizacao.nome = data.nome.trim();
    }

    if (data.responsavel) {
      dadosAtualizacao.responsavel = data.responsavel.trim();
    }

    const instituicaoAtualizada =
      await prisma.instituicaoParceira.update({
        where: {
          id,
        },
        data: dadosAtualizacao,
      });

    return res.status(200).json({
      mensagem: "Instituição atualizada com sucesso.",
      instituicao: instituicaoAtualizada,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Dados inválidos.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        error: "Instituição não encontrada.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "Já existe um cadastro utilizando esse e-mail.",
      });
    }

    console.error(`PUT /instituicoes/${id} error:`, error);

    return res.status(500).json({
      error: "Erro interno ao atualizar a instituição.",
    });
  }
};

/* =========================================================
   REMOVER INSTITUIÇÃO
========================================================= */

const removeInstituicao = async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      error: "ID inválido. Informe um número inteiro positivo.",
    });
  }

  try {
    const instituicao =
      await prisma.instituicaoParceira.findFirst({
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
        ativa: false,
      },
    });

    return res.status(200).json({
      mensagem: "Instituição removida com sucesso.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        error: "Instituição não encontrada.",
      });
    }

    console.error(`DELETE /instituicoes/${id} error:`, error);

    return res.status(500).json({
      error: "Erro interno ao remover a instituição.",
    });
  }
};

/* =========================================================
   ATUALIZAR STATUS
========================================================= */

const atualizaStatus = async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      error: "ID inválido. Informe um número inteiro positivo.",
    });
  }

  try {
    const { statusOk } = req.body;

    const statusNormalizado =
      typeof statusOk === "string"
        ? statusOk.toUpperCase()
        : "";

    const valoresValidos = ["OK", "PENDENTE"];  

    if (!valoresValidos.includes(statusNormalizado)) {
      return res.status(400).json({
        error: 'O status deve ser "OK" ou "PENDENTE".',
      });
    }

    const instituicao =
      await prisma.instituicaoParceira.findFirst({
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

    const instituicaoAtualizada =
      await prisma.instituicaoParceira.update({
        where: {
          id,
        },
        data: {
          statusOk: statusNormalizado,
        },
      });

    return res.status(200).json({
      mensagem: "Status atualizado com sucesso.",
      instituicao: instituicaoAtualizada,
    });
  } catch (error) {
    console.error(
      `PATCH /instituicoes/${id}/status error:`,
      error,
    );

    return res.status(500).json({
      error: "Erro interno ao atualizar o status.",
    });
  }
};

/* =========================================================
   LISTAR BENEFICIÁRIOS DA INSTITUIÇÃO
========================================================= */

const listarBeneficiariosInstituicao = async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      error: "ID inválido. Informe um número inteiro positivo.",
    });
  }

  try {
    const instituicao =
      await prisma.instituicaoParceira.findFirst({
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

    const beneficiarios = await prisma.beneficiario.findMany({
      where: {
        instituicaoId: id,
      },
      orderBy: {
        nomeCompleto: "asc",
      },
    });

    return res.status(200).json(beneficiarios);
  } catch (error) {
    console.error(
      `GET /instituicoes/${id}/beneficiarios error:`,
      error,
    );

    return res.status(500).json({
      error:
        "Erro interno ao listar os beneficiários da instituição.",
    });
  }
};

/* =========================================================
   COMPATIBILIDADE COM IMPORTAÇÃO DEFAULT
========================================================= */

/*
 * Mantém o controller padrão caso alguma rota antiga esteja usando:
 *
 * import InstituicaoController from "...";
 * router.get("/", InstituicaoController.index);
 */
class InstituicaoController {
  async index(req, res) {
    return listarInstituicoes(req, res);
  }
}

export default new InstituicaoController();

/* =========================================================
   EXPORTAÇÕES UTILIZADAS NAS ROTAS
========================================================= */

export {
  cadastrarInstituicao,
  listarInstituicoes,
  detalheDaInstituicao,
  atualizarDadosInstituicao,
  removeInstituicao,
  atualizaStatus,
  listarBeneficiariosInstituicao,
};