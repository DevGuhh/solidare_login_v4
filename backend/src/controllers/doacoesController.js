import { prisma } from "../config/db.js";
import { criarDoacaoSchema } from "../validators/doacaoValidator.js";
import { startOfMonth, endOfMonth } from "date-fns";
import { z, ZodError } from "zod";
import { gerarCodigoDoacao } from "../utils/generateCode.js";
import { calcularQuantidadeCestas } from "../utils/generateQtdCestas.js";

// =====================================================
// SCHEMAS AUXILIARES
// =====================================================

const alterarComprovanteSchema = z.object({
  comprovante: z.boolean({
    required_error: "Informe o status do comprovante.",
    invalid_type_error: "O campo comprovante deve ser verdadeiro ou falso.",
  }),
});

// =====================================================
// MONTAR FILTRO DE ACESSO
// =====================================================

function montarFiltroAcessoDoacao(req, id) {
  const where = {
    id,

    deletedAt: null,
  };

  if (req.user.role !== "ADMIN") {
    where.instituicaoId = req.user.instituicaoId;
  }

  return where;
}

// =====================================================
// INCLUDE PADRÃO
// =====================================================

const includeDoacao = {
  beneficiario: {
    select: {
      id: true,

      nomeCompleto: true,
    },
  },

  instituicao: {
    select: {
      id: true,

      nome: true,
    },
  },

  usuario: {
    select: {
      id: true,

      nome: true,
    },
  },
};

class DoacoesController {
  async index(req, res) {
    try {
      const where = {
        deletedAt: null,
      };

      if (req.user.role === "INSTITUICAO") {
        where.instituicaoId = req.user.instituicaoId;
      } else if (req.user.role === "ADMIN") {
        if (req.query.instituicaoId !== undefined) {
          const instituicaoId = Number(req.query.instituicaoId);

          if (!Number.isInteger(instituicaoId) || instituicaoId <= 0) {
            return res.status(400).json({
              error:
                "O parâmetro instituicaoId deve ser um número inteiro válido.",
            });
          }

          where.instituicaoId = instituicaoId;
        }
      } else {
        return res.status(403).json({
          error: "Acesso não autorizado.",
        });
      }

      const doacoes = await prisma.doacao.findMany({
        where,

        include: includeDoacao,

        orderBy: {
          dataDoacao: "desc",
        },
      });

      return res.status(200).json(doacoes);
    } catch (error) {
      console.error("GET /doacoes - erro ao listar:", error);

      return res.status(500).json({
        error: "Erro ao listar as doações.",
      });
    }
  }

  async show(req, res) {
    const id = obterIdValido(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: "ID inválido.",
      });
    }

    try {
      const where = montarFiltroAcessoDoacao(req, id);

      const doacao = await prisma.doacao.findFirst({
        where,

        include: includeDoacao,
      });

      if (!doacao) {
        return res.status(404).json({
          error: "Doação não encontrada.",
        });
      }

      return res.status(200).json(doacao);
    } catch (error) {
      console.error(`GET /doacoes/${req.params.id} - erro ao buscar:`, error);

      return res.status(500).json({
        error: "Erro ao buscar doação.",
      });
    }
  }

  async create(req, res) {
    try {
      // =========================================
      // VALIDAR DADOS
      // =========================================

      const data = criarDoacaoSchema.parse(req.body);

      // =========================================
      // FILTRO DO BENEFICIÁRIO
      // =========================================

      const whereBeneficiario = {
        id: data.beneficiarioId,

        deletedAt: null,

        ativo: true,
      };

      if (req.user.role !== "ADMIN") {
        whereBeneficiario.instituicaoId = req.user.instituicaoId;
      }

      // =========================================
      // BUSCAR BENEFICIÁRIO
      // =========================================

      const beneficiario = await prisma.beneficiario.findFirst({
        where: whereBeneficiario,

        select: {
          id: true,
          nomeCompleto: true,
          instituicaoId: true,
          ativo: true,
          composicaoFamiliar: true,
        },
      });

      if (!beneficiario) {
        return res.status(403).json({
          error:
            req.user.role === "ADMIN"
              ? "Beneficiário não encontrado ou inativo."
              : "Este beneficiário não pertence à sua instituição ou está inativo.",
        });
      }

      // =========================================
      // VERIFICAR DOAÇÃO NO MÊS
      // =========================================

      const inicioMes = startOfMonth(new Date());

      const fimMes = endOfMonth(new Date());

      const doacaoExiste = await prisma.doacao.findFirst({
        where: {
          beneficiarioId: beneficiario.id,
          deletedAt: null,
          dataDoacao: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
      });

      if (doacaoExiste) {
        return res.status(400).json({
          error: "Este beneficiário já recebeu uma doação neste mês.",
        });
      }

      // =========================================
      // CRIAR DOAÇÃO
      // =========================================

      const codigo = gerarCodigoDoacao();

      const quantidade = calcularQuantidadeCestas(beneficiario.composicaoFamiliar);


      const doacao = await prisma.doacao.create({
        data: {
          codigo,
          beneficiarioId: beneficiario.id,
          instituicaoId: beneficiario.instituicaoId,
          usuarioId: req.user.id,
          tipo: data.tipo,
          quantidade,
          observacoes: data.observacoes,
        },

        include: includeDoacao,
      });

      return res.status(201).json(doacao);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload inválido.",

          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),

            message: issue.message,
          })),
        });
      }

      console.error("POST /doacoes - erro ao cadastrar:", error);

      return res.status(500).json({
        error: "Erro interno ao cadastrar doação.",
      });
    }
  }

  async update(req, res) {
    const atualizarDoacaoSchema = criarDoacaoSchema.partial();

    const id = obterIdValido(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: "ID inválido.",
      });
    }

    try {
      const whereDoacao = montarFiltroAcessoDoacao(req, id);

      const doacaoExistente = await prisma.doacao.findFirst({
        where: whereDoacao,
      });

      if (!doacaoExistente) {
        return res.status(404).json({
          error: "Doação não encontrada.",
        });
      }

      const data = atualizarDoacaoSchema.parse(req.body);

      let instituicaoId = doacaoExistente.instituicaoId;

      // =========================================
      // VALIDAR NOVO BENEFICIÁRIO
      // =========================================

      if (data.beneficiarioId !== undefined) {
        const whereBeneficiario = {
          id: data.beneficiarioId,

          deletedAt: null,

          ativo: true,
        };

        if (req.user.role !== "ADMIN") {
          whereBeneficiario.instituicaoId = req.user.instituicaoId;
        }

        const beneficiario = await prisma.beneficiario.findFirst({
          where: whereBeneficiario,

          select: {
            id: true,

            instituicaoId: true,
          },
        });

        if (!beneficiario) {
          return res.status(403).json({
            error:
              req.user.role === "ADMIN"
                ? "Beneficiário não encontrado ou inativo."
                : "Este beneficiário não pertence à sua instituição ou está inativo.",
          });
        }

        instituicaoId = beneficiario.instituicaoId;
      }

      const doacaoAtualizada = await prisma.doacao.update({
        where: {
          id,
        },

        data: {
          ...data,

          instituicaoId,
        },

        include: includeDoacao,
      });

      return res.status(200).json(doacaoAtualizada);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload inválido.",

          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),

            message: issue.message,
          })),
        });
      }

      console.error(
        `PUT /doacoes/${req.params.id} - erro ao atualizar:`,
        error,
      );

      return res.status(500).json({
        error: "Erro interno ao atualizar doação.",
      });
    }
  }

  async alterarComprovante(req, res) {
    const id = obterIdValido(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: "ID inválido.",
      });
    }

    try {
      const dados = alterarComprovanteSchema.parse(req.body);

      const where = montarFiltroAcessoDoacao(req, id);

      /*
       * Primeiro buscamos usando o filtro
       * completo de autorização.
       */
      const doacaoExistente = await prisma.doacao.findFirst({
        where,

        select: {
          id: true,

          comprovante: true,

          instituicaoId: true,
        },
      });

      if (!doacaoExistente) {
        return res.status(404).json({
          error: "Doação não encontrada.",
        });
      }

      /*
       * Se o status enviado já for o atual,
       * apenas retornamos os dados sem fazer
       * uma atualização desnecessária.
       */
      if (doacaoExistente.comprovante === dados.comprovante) {
        const doacaoAtual = await prisma.doacao.findUnique({
          where: {
            id,
          },

          include: includeDoacao,
        });

        return res.status(200).json({
          mensagem: dados.comprovante
            ? "A doação já está marcada com comprovante."
            : "A doação já está marcada sem comprovante.",

          doacao: doacaoAtual,
        });
      }

      const doacaoAtualizada = await prisma.doacao.update({
        where: {
          id,
        },

        data: {
          comprovante: dados.comprovante,
        },

        include: includeDoacao,
      });

      return res.status(200).json({
        mensagem: dados.comprovante
          ? "Comprovante confirmado com sucesso."
          : "Comprovante removido com sucesso.",

        doacao: doacaoAtualizada,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Payload inválido.",

          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),

            message: issue.message,
          })),
        });
      }

      console.error(
        `PATCH /doacoes/${req.params.id}/comprovante - erro:`,
        error,
      );

      return res.status(500).json({
        error: "Erro ao atualizar o comprovante da doação.",
      });
    }
  }

  async destroy(req, res) {
    const id = obterIdValido(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: "ID inválido.",
      });
    }

    try {
      const where = montarFiltroAcessoDoacao(req, id);

      const doacao = await prisma.doacao.findFirst({
        where,

        select: {
          id: true,
        },
      });

      if (!doacao) {
        return res.status(404).json({
          error: "Doação não encontrada.",
        });
      }

      await prisma.doacao.update({
        where: {
          id,
        },

        data: {
          deletedAt: new Date(),
        },
      });

      return res.status(200).json({
        mensagem: "Doação cancelada com sucesso.",
      });
    } catch (error) {
      console.error(`DELETE /doacoes/${req.params.id} - erro:`, error);

      return res.status(500).json({
        error: "Erro ao cancelar a doação.",
      });
    }
  }
}

export default new DoacoesController();
