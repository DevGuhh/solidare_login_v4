// ==========================================================================
// ARQUIVO COMENTADO PARA ESTUDO
// ==========================================================================

import { Prisma } from "@prisma/client";

// Importa o "prisma", que é a ferramenta usada para conversar com o banco
// de dados sem precisar escrever comandos SQL complicados na mão.
import { prisma } from "../config/db.js";

// Importa o "schema" (lista de regras) que define como os dados de uma
// doação devem estar formatados. Exemplo de regra: "quantidade tem que
// ser número" ou "beneficiarioId não pode estar vazio".
import { criarDoacaoSchema } from "../validators/doacaoValidator.js";

// Importa duas funções prontas de uma biblioteca de datas:
// - startOfMonth: recebe uma data e devolve o PRIMEIRO dia daquele mês.
// - endOfMonth: recebe uma data e devolve o ÚLTIMO dia daquele mês.
import { startOfMonth, endOfMonth } from "date-fns";

// Importa o tipo de erro que a biblioteca "zod" cria quando os dados
// enviados não seguem as regras do schema (usado lá embaixo no catch).
import { ZodError } from "zod";

// Importa uma função própria do projeto que gera um código único para
// identificar a doação (como um "número de protocolo").
import { gerarCodigoDoacao } from "../utils/generateCode.js";

// --------------------------------------------------------------------------
// Função principal: cadastra uma doação.
// "req" (request) = o que chegou do usuário/frontend.
// "res" (response) = o que vamos devolver como resposta.
// É uma função "async" porque ela precisa ESPERAR respostas do banco de
// dados, que não chegam instantaneamente.
// --------------------------------------------------------------------------
const cadastrarDoacao = async (req, res) => {

  try {

    // =====================================================
    // VALIDAR DADOS RECEBIDOS
    // =====================================================

    const data =
      criarDoacaoSchema.parse(
        req.body
      );


    // =====================================================
    // MONTAR FILTRO DO BENEFICIÁRIO
    // =====================================================

    const whereBeneficiario = {

      id:
        data.beneficiarioId,

      deletedAt:
        null,

      ativo:
        true,

    };


    /*
     * Usuário de instituição só pode cadastrar
     * doação para beneficiário da própria instituição.
     *
     * O ADMIN não recebe esse filtro e pode escolher
     * qualquer beneficiário ativo do sistema.
     */
    if (
      req.user.role !== "ADMIN"
    ) {

      whereBeneficiario.instituicaoId =
        req.user.instituicaoId;

    }


    // =====================================================
    // BUSCAR BENEFICIÁRIO
    // =====================================================

    const beneficiario =
      await prisma.beneficiario.findFirst({

        where:
          whereBeneficiario,

        select: {

          id:
            true,

          nomeCompleto:
            true,

          instituicaoId:
            true,

          ativo:
            true,

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


    // =====================================================
    // VERIFICAR DOAÇÃO NO MÊS
    // =====================================================

    const inicioMes =
      startOfMonth(
        new Date()
      );

    const fimMes =
      endOfMonth(
        new Date()
      );


    const doacaoExiste =
      await prisma.doacao.findFirst({

        where: {

          beneficiarioId:
            beneficiario.id,

          deletedAt:
            null,

          dataDoacao: {

            gte:
              inicioMes,

            lte:
              fimMes,

          },

        },

      });


    if (doacaoExiste) {

      return res.status(400).json({

        error:
          "Este beneficiário já recebeu uma doação neste mês.",

      });

    }


    // =====================================================
    // GERAR CÓDIGO
    // =====================================================

    const codigo =
      gerarCodigoDoacao();


    // =====================================================
    // CADASTRAR DOAÇÃO
    // =====================================================

    const doacao =
      await prisma.doacao.create({

        data: {

          codigo,

          beneficiarioId:
            beneficiario.id,

          /*
           * A instituição sempre vem do beneficiário.
           *
           * Isso funciona tanto para ADMIN quanto
           * para usuário INSTITUICAO e evita que uma
           * doação seja registrada na instituição errada.
           */
          instituicaoId:
            beneficiario.instituicaoId,

          usuarioId:
            req.user.id,

          tipo:
            data.tipo,

          quantidade:
            data.quantidade,

          observacoes:
            data.observacoes,

        },

        include: {

          beneficiario: {

            select: {

              id:
                true,

              nomeCompleto:
                true,

            },

          },

          instituicao: {

            select: {

              id:
                true,

              nome:
                true,

            },

          },

          usuario: {

            select: {

              id:
                true,

              nome:
                true,

            },

          },

        },

      });


    return res.status(201).json(
      doacao
    );

  } catch (error) {

    if (
      error instanceof ZodError
    ) {

      return res.status(400).json({

        error:
          "Payload inválido",

        issues:
          error.issues.map(
            (issue) => ({

              path:
                issue.path.join("."),

              message:
                issue.message,

            })
          ),

      });

    }


    console.error(
      "POST /doacoes - erro ao cadastrar:",
      error
    );


    return res.status(500).json({

      error:
        "Erro interno ao cadastrar doação.",

    });

  }

};

// Controller responsável por LISTAR doações, com regras diferentes
// dependendo do tipo de usuário logado (instituição ou admin).

const listarDoacoes = async (req, res) => {
  // O bloco "try" contém tudo que pode dar certo ou dar errado.
  // Se algo falhar aqui dentro, o código pula direto para o "catch".
  try {
    // "where" é um objeto que vai guardar os FILTROS da busca no banco.
    // Começamos com um filtro fixo: só queremos doações que NÃO foram
    // deletadas (deletedAt: null = "não foi apagada").
    // Esse objeto vai sendo completado mais abaixo, dependendo de quem
    // está fazendo a requisição.
    const where = {
      deletedAt: null,
    };

    // "req.user.role" é o "cargo"/tipo do usuário que está logado
    // (isso normalmente vem de um token de autenticação verificado
    // antes de chegar aqui).

    // CASO 1: o usuário logado é de uma INSTITUIÇÃO.
    if (req.user.role === "INSTITUICAO") {
      // Uma instituição só pode ver as PRÓPRIAS doações, então forçamos
      // o filtro a usar o instituicaoId de quem está logado — mesmo que
      // ele tente pedir dados de outra instituição, o filtro sempre usa
      // o dele mesmo. Isso é uma proteção de segurança.
      where.instituicaoId = req.user.instituicaoId;

      // CASO 2: o usuário logado é ADMIN.
    } else if (req.user.role === "ADMIN") {
      // Um admin pode ver doações de QUALQUER instituição. Por isso,
      // aqui a gente permite que ele passe um filtro opcional pela URL,
      // tipo: /doacoes?instituicaoId=5

      // "req.query" contém os parâmetros que vêm depois do "?" na URL.
      // Verificamos se o admin passou esse parâmetro.
      if (req.query.instituicaoId !== undefined) {
        // Tudo que vem da URL chega como TEXTO (string), então
        // convertemos para número usando Number().
        const instituicaoId = Number(req.query.instituicaoId);

        // Validamos se o valor convertido é realmente um número inteiro
        // válido e maior que zero (um ID nunca pode ser 0 ou negativo).
        // Number.isInteger() verifica se é um número inteiro (sem casas
        // decimais). Se o texto não for um número válido, Number()
        // devolve "NaN" (Not a Number), que falha nesse teste.
        if (!Number.isInteger(instituicaoId) || instituicaoId <= 0) {
          // Se for inválido, avisamos o usuário com status 400
          // ("seu pedido tem algo errado") e paramos a execução aqui.
          return res.status(400).json({
            error:
              "O parâmetro instituiçãoId deve ser um número inteiro válido",
          });
        }

        // Se passou na validação, adicionamos o filtro por instituição.
        where.instituicaoId = instituicaoId;
      }
      // Se o admin NÃO passou instituicaoId nenhum, o filtro fica só
      // com "deletedAt: null" — ou seja, ele vê doações de TODAS as
      // instituições.

      // CASO 3: qualquer outro tipo de usuário (nem instituição, nem admin).
    } else {
      // Bloqueamos o acesso. status(403) = "Forbidden", ou seja,
      // "eu sei quem você é, mas você não tem permissão para isso".
      //
      // CORREÇÃO: no código original havia ".json(403).json({...})",
      // ou seja, .json() era chamado DUAS VEZES. Isso quebra a aplicação,
      // porque depois que a resposta é enviada uma vez, não dá pra
      // enviar de novo. O certo é usar .status(403) para definir o
      // código, e só UM .json() com o corpo da resposta.
      return res.status(403).json({
        error: "Acesso não autorizado.",
      });
    }

    // Agora sim: busca no banco de dados TODAS as doações que batem
    // com os filtros definidos no objeto "where" lá em cima.
    // "await" = espera a resposta do banco antes de continuar.
    const doacoes = await prisma.doacao.findMany({
      where,
      include: {
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
      },
      orderBy: {
        dataDoacao: "desc",
      },
    });

    // status(200) = "OK, deu tudo certo". Devolve a lista de doações
    // encontrada (pode ser uma lista vazia, se não houver nenhuma).
    return res.status(200).json(doacoes);
  } catch (error) {

      console.error(
          "GET /doacoes - erro ao listar:",
          error
      );

      return res.status(500).json({
          error: "Erro ao listar as doações.",
      });

  }
};

const detalheDeDoacao = async (req, res) => {

  const id =
    Number(req.params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return res.status(400).json({
      error: "ID inválido.",
    });

  }

  try {

    // =====================================================
    // MONTAR FILTRO DE ACESSO
    // =====================================================

    const where = {
      id,
      deletedAt: null,
    };

    /*
     * Usuários de instituição só podem visualizar
     * doações pertencentes à própria instituição.
     *
     * O ADMIN não recebe esse filtro e, portanto,
     * pode visualizar qualquer doação.
     */
    if (
      req.user.role !== "ADMIN"
    ) {

      where.instituicaoId =
        req.user.instituicaoId;

    }


    // =====================================================
    // BUSCAR DOAÇÃO
    // =====================================================

    const doacao =
      await prisma.doacao.findFirst({

        where,

        include: {

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

        },

      });


    if (!doacao) {

      return res.status(404).json({
        error: "Doação não encontrada.",
      });

    }


    return res.status(200).json(
      doacao
    );

  } catch (error) {

    console.error(
      `GET /doacoes/${req.params.id} - erro ao buscar:`,
      error
    );

    return res.status(500).json({
      error: "Erro ao buscar doação.",
    });

  }

};

const atualizarDoacaoSchema = criarDoacaoSchema.partial();

const atualizarUmaDoacao = async (req, res) => {

  const id =
    Number(req.params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return res.status(400).json({
      error: "ID inválido.",
    });

  }

  try {

    // =====================================================
    // MONTAR FILTRO DE ACESSO
    // =====================================================

    const whereDoacao = {
      id,
      deletedAt: null,
    };

    /*
     * Usuário de instituição só pode editar
     * doações da própria instituição.
     *
     * O ADMIN pode editar qualquer doação.
     */
    if (
      req.user.role !== "ADMIN"
    ) {

      whereDoacao.instituicaoId =
        req.user.instituicaoId;

    }


    // =====================================================
    // BUSCAR DOAÇÃO
    // =====================================================

    const doacaoExistente =
      await prisma.doacao.findFirst({

        where:
          whereDoacao,

      });


    if (!doacaoExistente) {

      return res.status(404).json({
        error: "Doação não encontrada.",
      });

    }


    // =====================================================
    // VALIDAR DADOS RECEBIDOS
    // =====================================================

    const data =
      atualizarDoacaoSchema.parse(
        req.body
      );


    // =====================================================
    // VALIDAR BENEFICIÁRIO, CASO TENHA SIDO ALTERADO
    // =====================================================

    let instituicaoId =
      doacaoExistente.instituicaoId;


    if (
      data.beneficiarioId !== undefined
    ) {

      const whereBeneficiario = {

        id:
          data.beneficiarioId,

        deletedAt:
          null,

        ativo:
          true,

      };


      if (
        req.user.role !== "ADMIN"
      ) {

        whereBeneficiario.instituicaoId =
          req.user.instituicaoId;

      }


      const beneficiario =
        await prisma.beneficiario.findFirst({

          where:
            whereBeneficiario,

          select: {

            id:
              true,

            instituicaoId:
              true,

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


      instituicaoId =
        beneficiario.instituicaoId;

    }


    // =====================================================
    // ATUALIZAR DOAÇÃO
    // =====================================================

    const doacaoAtualizada =
      await prisma.doacao.update({

        where: {
          id,
        },

        data: {

          ...data,

          instituicaoId,

        },

        include: {

          beneficiario: {

            select: {

              id:
                true,

              nomeCompleto:
                true,

            },

          },

          instituicao: {

            select: {

              id:
                true,

              nome:
                true,

            },

          },

          usuario: {

            select: {

              id:
                true,

              nome:
                true,

            },

          },

        },

      });


    return res.status(200).json(
      doacaoAtualizada
    );

  } catch (error) {

    if (
      error instanceof ZodError
    ) {

      return res.status(400).json({

        error:
          "Payload inválido",

        issues:
          error.issues.map(
            (issue) => ({

              path:
                issue.path.join("."),

              message:
                issue.message,

            })
          ),

      });

    }


    console.error(
      `PUT /doacoes/${req.params.id} - erro ao atualizar:`,
      error
    );


    return res.status(500).json({

      error:
        "Erro interno ao atualizar doação.",

    });

  }

};

const cancelarDoacao = async (req, res) => {

    const id =
        Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        return res.status(400).json({
            error: "ID inválido."
        });

    }

    try {

        // =====================================================
        // MONTAR FILTRO
        // =====================================================

        const where = {

            id,

            deletedAt: null

        };

        /*
         * O ADMIN pode cancelar qualquer doação.
         *
         * Usuário da instituição apenas
         * as da própria instituição.
         */
        if (
            req.user.role !== "ADMIN"
        ) {

            where.instituicaoId =
                req.user.instituicaoId;

        }


        // =====================================================
        // BUSCAR DOAÇÃO
        // =====================================================

        const doacao =
            await prisma.doacao.findFirst({

                where

            });


        if (!doacao) {

            return res.status(404).json({

                error:
                    "Doação não encontrada."

            });

        }


        // =====================================================
        // SOFT DELETE
        // =====================================================

        await prisma.doacao.update({

            where: {

                id

            },

            data: {

                deletedAt:
                    new Date()

            }

        });


        return res.status(200).json({

            mensagem:
                "Doação cancelada com sucesso."

        });

    } catch (error) {

        console.error(

            `DELETE /doacoes/${req.params.id}:`,

            error

        );

        return res.status(500).json({

            error:
                "Erro ao cancelar a doação."

        });

    }

};

// Exporta a função para que ela possa ser usada em outros arquivos
// (por exemplo, no arquivo de rotas que liga essa função a uma URL,
// tipo POST /doacoes).
export { cadastrarDoacao, listarDoacoes, detalheDeDoacao, atualizarUmaDoacao, cancelarDoacao };
