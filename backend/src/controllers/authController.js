import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";


// ======================================================
// CADASTRAR USUÁRIO
// ======================================================

const register = async (req, res) => {

    try {

        /*
         * O nome correto recebido do frontend deve ser "senha".
         *
         * Mantemos também "senhaHash" temporariamente para garantir
         * compatibilidade com formulários antigos do projeto.
         */
        const {
            nome,
            email,
            senha,
            senhaHash,
            role,
            instituicaoId
        } = req.body;

        const senhaRecebida = senha || senhaHash;

        // Remove espaços e padroniza o e-mail em letras minúsculas
        const emailNormalizado = email
            ? email.trim().toLowerCase()
            : "";

        // ==================================================
        // VALIDAÇÃO DOS CAMPOS
        // ==================================================

        if (!nome || !emailNormalizado || !senhaRecebida) {

            return res.status(400).json({
                error: "Nome, e-mail e senha são obrigatórios."
            });

        }

        if (senhaRecebida.length < 6) {

            return res.status(400).json({
                error: "A senha deve possuir pelo menos 6 caracteres."
            });

        }

        // ==================================================
        // VERIFICA SE O E-MAIL JÁ EXISTE
        // ==================================================

        const userExists = await prisma.usuario.findUnique({

            where: {
                email: emailNormalizado
            }

        });

        if (userExists) {

            return res.status(409).json({
                error: "Este e-mail já está cadastrado."
            });

        }

        // ==================================================
        // CRIPTOGRAFA A SENHA
        // ==================================================

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            senhaRecebida,
            salt
        );

        // ==================================================
        // MONTA OS DADOS DO NOVO USUÁRIO
        // ==================================================

        const dadosNovoUsuario = {

            nome: nome.trim(),

            email: emailNormalizado,

            senhaHash: hashedPassword

        };

        /*
         * Role e instituição só são adicionados quando forem enviados.
         * Caso não sejam enviados, o Prisma utilizará os valores padrão
         * definidos no schema.
         */
        if (role) {
            dadosNovoUsuario.role = role;
        }

        if (
            instituicaoId !== undefined &&
            instituicaoId !== null &&
            instituicaoId !== ""
        ) {

            dadosNovoUsuario.instituicaoId =
                Number(instituicaoId);

        }

        // ==================================================
        // CRIA O USUÁRIO
        // ==================================================

        const usuario = await prisma.usuario.create({

            data: dadosNovoUsuario

        });

        // ==================================================
        // GERA O TOKEN JWT
        // ==================================================

        const token = generateToken(
            usuario.id,
            res,
            usuario.role
        );

        // ==================================================
        // RESPOSTA
        // ==================================================

        return res.status(201).json({

            status: "sucesso",

            mensagem: "Usuário cadastrado com sucesso.",

            /*
             * Token no nível principal para funcionar com o login.js.
             */
            token,

            data: {

                usuario: {

                    id: usuario.id,

                    nome: usuario.nome,

                    email: usuario.email,

                    role: usuario.role,

                    ativo: usuario.ativo,

                    instituicaoId: usuario.instituicaoId

                },

                /*
                 * Mantido também dentro de data para compatibilidade
                 * com partes antigas do frontend.
                 */
                token

            }

        });

    } catch (erro) {

        console.error(
            "Erro ao cadastrar usuário:",
            erro
        );

        return res.status(500).json({
            error: "Erro interno ao cadastrar usuário."
        });

    }

};


// ======================================================
// REALIZAR LOGIN
// ======================================================

const login = async (req, res) => {

    try {

        /*
         * O frontend atual envia:
         *
         * {
         *     email: "...",
         *     senha: "..."
         * }
         *
         * senhaHash é mantido apenas como compatibilidade temporária.
         */
        const {
            email,
            senha,
            senhaHash
        } = req.body;

        const senhaRecebida = senha || senhaHash;

        const emailNormalizado = email
            ? email.trim().toLowerCase()
            : "";

        // ==================================================
        // VALIDAÇÃO DOS CAMPOS
        // ==================================================

        if (!emailNormalizado || !senhaRecebida) {

            return res.status(400).json({
                error: "E-mail e senha são obrigatórios."
            });

        }

        // ==================================================
        // BUSCA O USUÁRIO
        // ==================================================

        const usuario = await prisma.usuario.findUnique({

            where: {
                email: emailNormalizado
            }

        });

        /*
         * Usamos a mesma mensagem para usuário inexistente
         * ou senha incorreta. Isso evita revelar quais e-mails
         * estão cadastrados no sistema.
         */
        if (!usuario) {

            return res.status(401).json({
                error: "E-mail ou senha inválidos."
            });

        }

        // ==================================================
        // VERIFICA SE O USUÁRIO ESTÁ ATIVO
        // ==================================================

        if (!usuario.ativo) {

            return res.status(403).json({
                error: "Este usuário está inativo. Procure um administrador."
            });

        }

        // ==================================================
        // CONFERE SE EXISTE SENHA NO BANCO
        // ==================================================

        if (!usuario.senhaHash) {

            console.error(
                `Usuário de ID ${usuario.id} está sem senhaHash no banco.`
            );

            return res.status(500).json({
                error: "O usuário está sem uma senha configurada."
            });

        }

        // ==================================================
        // COMPARA A SENHA DIGITADA COM O HASH
        // ==================================================

        const isPasswordValid = await bcrypt.compare(

            senhaRecebida,

            usuario.senhaHash

        );

        if (!isPasswordValid) {

            return res.status(401).json({
                error: "E-mail ou senha inválidos."
            });

        }

        // ==================================================
        // GERA O TOKEN JWT
        // ==================================================

        const token = generateToken(
            usuario.id,
            res,
            usuario.role
        );

        // ==================================================
        // RETORNA O LOGIN
        // ==================================================

        return res.status(200).json({

            status: "sucesso",

            mensagem: "Login realizado com sucesso.",

            /*
             * Seu login.js verifica dados.token.
             * Por isso o token precisa estar neste nível.
             */
            token,

            data: {

                usuario: {

                    id: usuario.id,

                    nome: usuario.nome,

                    email: usuario.email,

                    role: usuario.role,

                    ativo: usuario.ativo,

                    instituicaoId: usuario.instituicaoId

                },

                /*
                 * Também deixamos dentro de data para manter
                 * compatibilidade com códigos antigos.
                 */
                token

            }

        });

    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        /*
         * Como respondemos sempre com JSON, o frontend não receberá
         * mais uma página HTML de erro e não exibirá:
         *
         * Unexpected token '<'
         */
        return res.status(500).json({
            error: "Erro interno ao realizar login."
        });

    }

};


// ======================================================
// REALIZAR LOGOUT
// ======================================================

const logout = async (req, res) => {

    try {

        // Apaga o cookie JWT, caso ele esteja sendo utilizado
        res.cookie("jwt", "", {

            httpOnly: true,

            expires: new Date(0),

            sameSite: "lax"

        });

        return res.status(200).json({

            status: "sucesso",

            mensagem: "Desconectado com sucesso."

        });

    } catch (erro) {

        console.error(
            "Erro ao realizar logout:",
            erro
        );

        return res.status(500).json({
            error: "Erro interno ao realizar logout."
        });

    }

};


// ======================================================
// EXPORTA OS CONTROLLERS
// ======================================================

export {
    register,
    login,
    logout
};