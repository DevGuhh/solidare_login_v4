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
  // O bloco "try" contém tudo que pode dar certo OU dar errado.
  // Se qualquer linha aqui dentro falhar, o código pula direto para o
  // bloco "catch" lá embaixo, em vez de travar o servidor inteiro.
  try {
    // Pega os dados enviados pelo usuário (req.body) e verifica se eles
    // seguem as regras do schema. Se estiver tudo certo, "data" passa a
    // conter os dados já validados e prontos para uso.
    // Se estiver errado, essa linha "explode" um erro (ZodError) e o
    // código pula direto para o catch.
    const data = criarDoacaoSchema.parse(req.body);

    const beneficiario = await prisma.beneficiario.findFirst({
      where: {
        id: data.beneficiarioId,
        instituicaoId: req.user.instituicaoId,
        deletedAt: null,
      },
    });

    if (!beneficiario) {
      return res.status(403).json({
        error: "Este beneficiário não pertence à sua instituição.",
      });
    }

    // Pega a data/hora atual (new Date()) e calcula o primeiro dia do
    // mês corrente. Ex: se hoje é 08/07/2026, inicioMes = 01/07/2026.
    const inicioMes = startOfMonth(new Date());

    // Calcula o último dia do mês corrente.
    // Ex: se hoje é 08/07/2026, fimMes = 31/07/2026.
    const fimMes = endOfMonth(new Date());

    // Pergunta ao banco de dados: "existe alguma doação que já foi feita
    // para ESSE MESMO beneficiário, dentro DESTE MÊS, que não tenha sido
    // deletada?"
    // "await" = espera a resposta do banco antes de continuar, porque
    // essa consulta leva um tempinho para ser respondida.
    const doacaoExiste = await prisma.doacao.findFirst({
      where: {
        // Mesmo beneficiário informado na requisição.
        beneficiarioId: data.beneficiarioId,

        // "deletedAt: null" significa "que não foi apagada" (muitos
        // sistemas não apagam registros de verdade, apenas marcam a
        // data em que foram "deletados" — isso se chama soft delete).
        deletedAt: null,

        // Verifica se a data da doação está DENTRO do intervalo do
        // mês atual.
        dataDoacao: {
          gte: inicioMes, // gte = "greater than or equal" (maior ou igual ao início do mês)
          lte: fimMes, // lte = "less than or equal" (menor ou igual ao fim do mês)
        },
      },
    });

    // Se "doacaoExiste" tiver algum valor (ou seja, encontrou uma doação),
    // a função para tudo aqui e devolve um erro para quem fez o pedido.
    if (doacaoExiste) {
      // status(400) = "código HTTP" que indica que o PEDIDO tem algo
      // errado (nesse caso, uma regra de negócio foi violada).
      return res.status(400).json({
        error: "Este beneficiário já recebeu uma doação neste mês.",
      });
    }

    // Gera um código único para identificar essa nova doação.
    const codigo = gerarCodigoDoacao();

    // Agora sim: salva a doação no banco de dados.
    // "await" novamente, porque salvar no banco também leva um tempo.
    const doacao = await prisma.doacao.create({
      data: {
        codigo, // código gerado acima
        beneficiarioId: data.beneficiarioId, // quem recebe a doação
        instituicaoId: req.user.instituicaoId, // instituição do usuário logado
        usuarioId: req.user.id, // quem está cadastrando (peguei do login)
        tipo: data.tipo, // tipo da doação (defalt: "CESTA")
        quantidade: data.quantidade, // quantidade doada
        observacoes: data.observacoes, // observações extras, se houver
      },
    });

    // status(201) = "código HTTP" que indica "criado com sucesso".
    // Devolve a doação recém-criada como resposta.
    return res.status(201).json(doacao);
  } catch (error) {
    // ------------------------------------------------------------------
    // Bloco "catch": é o "plano B" para quando algo dá errado no "try".
    // ------------------------------------------------------------------

    // Verifica se o erro é do tipo ZodError, ou seja, se o problema foi
    // nos DADOS enviados pelo usuário (ex: campo faltando, tipo errado).
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Payload inválido",
        // Monta uma lista amigável mostrando exatamente quais campos
        // deram problema e por quê, para facilitar a correção.
        issues: error.issues.map((e) => ({
          path: e.path.join("."), // caminho do campo com erro (ex: "quantidade")
          message: e.message, // mensagem explicando o erro
        })),
      });
    }

    // Se o erro NÃO foi de validação (ex: banco de dados fora do ar),
    // registra o erro no console para o desenvolvedor investigar depois.
    console.error("POST /doacoes:", error);

    // Devolve uma mensagem genérica para quem usou a API, sem expor
    // detalhes internos sensíveis do sistema.
    // status(500) = "código HTTP" que indica erro INTERNO do servidor.
    return res.status(500).json({
      error: "Erro interno ao cadastrar doação.",
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
    const doacao = await prisma.doacao.findMany({
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

    // status(200) = "OK, deu tudo certo". Devolve a lista de doações
    // encontrada (pode ser uma lista vazia, se não houver nenhuma).
    return res.status(200).json(doacao);
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
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID Inválido.",
    });
  }

  try {
    const doacao = await prisma.doacao.findFirst({
      where: {
        id,
        instituicaoId: req.user.instituicaoId,
        deletedAt: null,
      },
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

    return res.status(200).json(doacao);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao buscar doação.",
    });
  }
};

const atualizarDoacaoSchema = criarDoacaoSchema.partial();

const atualizarUmaDoacao = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "ID Inválido.",
    });
  }

  try {
    const where = {
      id,
    };

    if (req.user.role !== "ADMIN") {
      where.instituicaoId = req.user.instituicaoId;
    }

    const doacao = await prisma.doacao.findFirst({
      where,
    });

    if (!doacao) {
      return res.status(404).json({
        error: "Doação não encontrada",
      });
    }

    const data = atualizarDoacaoSchema.parse(req.body);

    const update = await prisma.doacao.update({
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

    console.error(`PUT /doacoes/${req.params.id} error:`, error);

    return res.status(500).json({
      error: "Erro interno ao atualizar doação.",
    });
  }
};

const cancelarDoacao = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido" });
  }
  try {
    const doacao = await prisma.doacao.findUnique({
      where: {
        id,
      },
    });
    if (!doacao || doacao.deletedAt) {
      return res.status(404).json({
        error: "Doação não encontrada.",
      });
    }
    await prisma.doacao.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return res.status(200).json({
      mensagem: "Doação cancelada com sucesso!",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ error: "Doação não encontrada." });
    }
    console.error(`DELETE /doacoes/${req.params.id} error:`, error);
    return res.status(500).json({
      error: "Erro interno ao cancelar doação.",
    });
  }
};

// Exporta a função para que ela possa ser usada em outros arquivos
// (por exemplo, no arquivo de rotas que liga essa função a uma URL,
// tipo POST /doacoes).
export { cadastrarDoacao, listarDoacoes, detalheDeDoacao, atualizarUmaDoacao, cancelarDoacao };
