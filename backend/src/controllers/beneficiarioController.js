// Importa a instância do Prisma. 
// O Prisma é a ferramenta responsável por conversar com o banco de dados. 
// // Sempre que precisarmos buscar, criar, editar ou excluir informações, usaremos o prisma.
import { prisma } from "../config/db.js"

// Importa o tipo de erro do Zod. 
// O Zod é uma biblioteca que verifica se os dados enviados pelo usuário estão corretos antes de salvar no banco.
import { ZodError } from "zod"

// Importa o esquema (schema) de validação. 
// Esse arquivo contém todas as regras que um beneficiário deve seguir. 
// Exemplo: 
// - Nome é obrigatório.
// - CPF é obrigatório. 
// - CPF precisa estar no formato correto.
import {criarBeneficiarioSchema} from "../validators/beneficiarioValidator.js"

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
                instituicaoId: req.user.instituicaoId
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

export {cadastrarBeneficiario}