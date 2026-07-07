// Importa a instância do Prisma. 
// O Prisma é a ferramenta responsável por conversar com o banco de dados. 
// // Sempre que precisarmos buscar, criar, editar ou excluir informações, usaremos o prisma.
import { prisma } from "../config/db.js"

// Importa o tipo de erro do Zod. 
// O Zod é uma biblioteca que verifica se os dados enviados pelo usuário estão corretos antes de salvar no banco.
import { date, ZodError } from "zod"

// Importa o esquema (schema) de validação. 
// Esse arquivo contém todas as regras que um beneficiário deve seguir. 
// Exemplo: 
// - Nome é obrigatório.
// - CPF é obrigatório. 
// - CPF precisa estar no formato correto.
import {criarBeneficiarioSchema} from "../validators/beneficiarioValidator.js"
import { be } from "zod/v4/locales"
import { error } from "node:console"

// Cria a função responsável por cadastrar um beneficiário.
// "async" significa que essa função fará operações demoradas, como consultar ou salvar dados no banco.
// "req" (request) contém tudo o que o cliente enviou. 
// "res" (response) será usado para responder ao cliente.
const cadastrarBeneficiario = async (req, res) => {

    // O bloco try tenta executar todo o código abaixo. 
    // Se acontecer qualquer erro inesperado, o programa irá automaticamente para o bloco catch.
    try {

        // Valida os dados enviados pelo cliente. 
        // req.body contém o corpo da requisição. 
        // O método parse() verifica se esses dados seguem todas as regras definidas no schema.
        // Se estiver tudo correto: 
        // data receberá esses dados. 
        // Se houver algum erro:
        // o Zod lançará um ZodError.
        const data = criarBeneficiarioSchema.parse(req.body)

        // Procura no banco de dados um beneficiário 
        // que possua exatamente o mesmo CPF. 
        // await significa: 
        // "Espere o banco responder antes de continuar."
        const beneficiarioExiste = await prisma.beneficiario.findUnique({
            
            // where indica a condição da busca. 
            // Tradução: 
            // "Procure um beneficiário cujo CPF seja igual ao CPF enviado pelo usuário."
            where: {cpf: data.cpf},
        })

        // Verifica se a busca encontrou alguém. 
        // Se beneficiarioExiste possuir um objeto, significa que já existe alguém com esse CPF.
        if (beneficiarioExiste) {

            // Retorna imediatamente um erro 400. 
            // 400 significa: 
            // "O cliente enviou uma informação inválida." 
            // Neste caso, o CPF já está cadastrado.
            return res.status(400).json({
                error: "Beneficiário já existente com este CPF"
            })
        }

        // Caso nenhum beneficiário tenha sido encontrado, podemos criar um novo registro no banco.
        const novoBeneficiario = await prisma.beneficiario.create({

            // data representa os dados que serão salvos.
            data: {

                // O operador ... copia todas as propriedades 
                // existentes dentro do objeto "data". 
                // ...data equivale a escrever: 
                // nome: "Maria" 
                // cpf: "12345678900" 
                ...data, 

                // Acrescenta mais um campo ao objeto. 
                // instituicaoId não veio do usuário.
                // Ele foi colocado em req.user por um middleware de autenticação anteriormente. Dessa forma o beneficiário ficará associado à instituição do usuário logado.
                instituicaoId: req.user.instituicaoId,
                deletedAt: null
            }
        })

        res.status(201).json({
            mensagem: "Beneficiário cadastrado com sucesso!",
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


// Função responsável por listar os beneficiários da instituição do usuário autenticado.
const listarBeneficiarios = async (req, res) => {
    try {

        // Busca todos os beneficiários no banco que pertencem à mesma instituição do usuário logado.
        const beneficiario = await prisma.beneficiario.findMany({

            // Filtro da consulta.
            // Retorna apenas os registros cujo instituicaoId seja igual ao da instituição do usuário.
            where: {
            instituicaoId: req.user.instituicaoId,
            deletedAt: null
        },
    })
        // Retorna a lista de beneficiários.
        return res.status(200).json(beneficiario)
    } catch (error) {

        console.error("ERRO AO LISTAR BENEFICIÁRIOS:");
        console.error(error);
    
        return res.status(500).json({
            error: 'Erro ao listar os beneficiários.'
        });
    
    }
}

// Função responsável por buscar os detalhes de um beneficiário.
// "async" significa que ela pode esperar operações demoradas,
// como consultar o banco de dados.
const detalheDoBeneficiario = async (req, res) => {

    // Pega o ID enviado na URL.
    // Exemplo:
    // GET /beneficiarios/5
    // req.params.id será "5" (texto).
    //
    // Number() converte esse texto para um número.
    // Assim, "5" passa a ser 5.
    const id = Number(req.params.id)

    // Antes de consultar o banco, verificamos se o ID é válido.
    // Number.isInteger(id)
    // Verifica se o valor é um número inteiro.
    // O "!" significa "NÃO".
    // Então:
    // !Number.isInteger(id)
    // quer dizer:
    // "Se NÃO for um número inteiro..."
    // O operador || significa "OU".
    // Portanto, esta condição significa:
    // "Se o ID não for inteiro OU for menor ou igual a zero..."
    if (!Number.isInteger(id) || id <= 0) {

        // Retorna o status HTTP 400.
        // Esse código significa:
        // "O cliente enviou uma informação inválida."
        // Em seguida, envia um JSON com a mensagem de erro.
        return res.status(400).json({
            error: 'ID inválido.'
        })
    }

    // O bloco try tenta executar o código abaixo.
    // Se ocorrer algum erro inesperado (como perda de conexão
    // com o banco de dados), a execução será enviada para o catch.
    try {

        // Faz uma busca no banco de dados usando o Prisma.

        // "await" significa:
        // "Espere o banco responder antes de continuar."

        // prisma.beneficiario
        // representa a tabela (ou modelo) Beneficiario.

        // findFirst()
        // procura o primeiro registro que atender às condições.
        const beneficiario = await prisma.beneficiario.findFirst({
            // where significa:
            // "Procure apenas registros que satisfaçam estas condições."
            where: {
                // Primeira condição:
                // o ID precisa ser exatamente igual ao informado na URL.
                id,

                // Segunda condição:
                // o beneficiário precisa pertencer à mesma instituição do usuário que está autenticado.
                //
                // req.user contém informações do usuário logado, normalmente adicionadas por um middleware de autenticação.
                //
                // Isso impede que um usuário veja dados de outra instituição.
                instituicaoId: req.user.instituicaoId,
                deletedAt: null
            }
        })
        // Se nenhum beneficiário atender às condições acima,
        // o Prisma retorna null.
        //
        // O "!" verifica justamente isso:
        // "Se NÃO existe beneficiário..."
        if (!beneficiario) {

            // Retorna o status HTTP 404.
            // Esse código significa:
            // "O recurso solicitado não foi encontrado."
            return res.status(404).json({
                error: 'Beneficiário não encontrado'
            })
        }

        // Se chegou até aqui, significa que:
        // ✔ o ID era válido;
        // ✔ o beneficiário existe;
        // ✔ ele pertence à instituição do usuário.
        //
        // Então retornamos o status 200 (sucesso)
        // juntamente com todos os dados encontrados.
        return res.status(200).json(beneficiario)
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao buscar beneficiário.'
        })
    }
}

const atualizarBeneficiarioSchema = criarBeneficiarioSchema.partial()

const atualizarDadosBeneficiario = async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID inválido'
        })
    }
    
    

    try {
        const beneficiario = await prisma.beneficiario.findFirst({
        where: {
            id,
            instituicaoId: req.user.instituicaoId,
            deletedAt: null
        }
        })

        if (!beneficiario) {
            return res.status(404).json({
                error: "Beneficiário não encontrado."
            })
        }

        const data = atualizarBeneficiarioSchema.parse(req.body)
        const update = await prisma.beneficiario.update({
            where: {
                id
            },
            data
        }
        )
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
            return res.status(404).json({ error: 'Beneficiário não encontrado.'})
        }
        
        console.error(`PUT /beneficiarios/${req.params.id} error:`, error)
        return res.status(500).json({
            error: 'Erro interno ao atualizar beneficiário.'
        })
    }
}

const atualizarStatus = async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido.' })
    }

    try {

        const beneficiario = await prisma.beneficiario.findFirst({
        where: {
            id,
            instituicaoId: req.user.instituicaoId,
            deletedAt: null
        }
        })

        if (!beneficiario) {
            return res.status(404).json({
                error: "Beneficiário não encontrado."
            })
        }

        const data = atualizarBeneficiarioSchema.parse(req.body)
        const { ativo } = data

        const valoresValidos = [true, false]
        if (!valoresValidos.includes(ativo)) {
            return res.status(400).json({
                error: 'Status deve ser true ou false'
            })
        }

        const beneficiarioAtualizado = await prisma.beneficiario.update({
            where: { id },
            data: { ativo }
        })

        res.json(beneficiarioAtualizado)

    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors })
        }
        console.error(error) // ajuda a ver o erro real no terminal
        res.status(500).json({ erro: 'Erro interno do servidor' })
    }

}

const removeBeneficiario = async (req, res) => {
    const id = Number(req.params.id) 
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido. Use um inteiro positivo'})
    }

    try {
        const beneficiario = await prisma.beneficiario.findFirst({
        where: {
            id,
            instituicaoId: req.user.instituicaoId,
            deletedAt: null
        }
        })

        if (!beneficiario) {
            return res.status(404).json({
                error: "Beneficiário não encontrado."
            })
        }

        await prisma.beneficiario.update({
            where: { id 
            }, 
            data: {
                deletedAt: new Date()
            }
        })
        return res.status(204).json({
            mensagem: "Beneficiário deletado com sucesso!"
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    return res.status(404).json({ error: 'Beneficiário não encontrado.'})
                }
        
                console.error(`DELETE /instituicao/${req.params.id} error:`, error)
                return res.status(500).json({
                    error: 'Erro interno ao deletar beneficiário.'
                })
    }
}

export {cadastrarBeneficiario, listarBeneficiarios, detalheDoBeneficiario, atualizarDadosBeneficiario, atualizarStatus, removeBeneficiario}