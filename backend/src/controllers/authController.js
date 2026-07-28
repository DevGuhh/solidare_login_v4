import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { error } from "node:console";

class AuthController {
  async login(req, res) {
    try {
      const { email, senha, senhaHash } = req.body;
      const senhaRecebida = senha || senhaHash;
      const emailNormalizado = email ? email.trim().toLowerCase() : "";

      // ==================================================
      // VALIDAÇÃO DOS CAMPOS
      // ==================================================

      if (!emailNormalizado || !senhaRecebida) {
        return res.status(400).json({
          error: "E-mail e senha são obrigatórios.",
        });
      }

      // ==================================================
      // BUSCA O USUÁRIO
      // ==================================================

      const usuario = await prisma.usuario.findUnique({
        where: {
          email: emailNormalizado,
        },
      });

      /*
       * Usamos a mesma mensagem para usuário inexistente
       * ou senha incorreta. Isso evita revelar quais e-mails
       * estão cadastrados no sistema.
       */
      if (!usuario) {
        return res.status(401).json({
          error: "E-mail ou senha inválidos.",
        });
      }

      // ==================================================
      // VERIFICA SE O USUÁRIO ESTÁ ATIVO
      // ==================================================

      if (!usuario.ativo) {
        return res.status(403).json({
          error: "Este usuário está inativo. Procure um administrador.",
        });
      }

      // ==================================================
      // CONFERE SE EXISTE SENHA NO BANCO
      // ==================================================

      if (!usuario.senhaHash) {
        console.error(
          `Usuário de ID ${usuario.id} está sem senhaHash no banco.`,
        );

        return res.status(500).json({
          error: "O usuário está sem uma senha configurada.",
        });
      }

      // ==================================================
      // COMPARA A SENHA DIGITADA COM O HASH
      // ==================================================

      const isPasswordValid = await bcrypt.compare(
        senhaRecebida,

        usuario.senhaHash,
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          error: "E-mail ou senha inválidos.",
        });
      }

      // ==================================================
      // GERA O TOKEN JWT
      // ==================================================

      const token = generateToken(usuario.id, res, usuario.role);

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
            instituicaoId: usuario.instituicaoId,
            senhaProvisoria: usuario.senhaProvisoria,
          },

          /*
           * Também deixamos dentro de data para manter
           * compatibilidade com códigos antigos.
           */
          token,
        },
      });
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);

      /*
       * Como respondemos sempre com JSON, o frontend não receberá
       * mais uma página HTML de erro e não exibirá:
       *
       * Unexpected token '<'
       */
      return res.status(500).json({
        error: "Erro interno ao realizar login.",
      });
    }
  }
  async logout(req, res) {
    try {
      // Apaga o cookie JWT, caso ele esteja sendo utilizado
      res.cookie("jwt", "", {
        httpOnly: true,

        expires: new Date(0),

        sameSite: "lax",
      });

      return res.status(200).json({
        status: "sucesso",

        mensagem: "Desconectado com sucesso.",
      });
    } catch (erro) {
      console.error("Erro ao realizar logout:", erro);

      return res.status(500).json({
        error: "Erro interno ao realizar logout.",
      });
    }
  }
  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res
          .status(400)
          .json({ error: "Senha atual e nova senha são obrigatórias." });
      }
      if (novaSenha.length < 6) {
        return res
          .status(400)
          .json({ error: "A nova senha deve ter pelo menos 6 caracteres." });
      }
      const usuario = await prisma.usuario.findUnique({
        where: {
          id: req.user.id,
        },
      });

      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
      if (!senhaValida) {
        return res.status(401).json({ error: "Senha atual incorreta." });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await prisma.usuario.update({
        where: { id: req.user.id },
        data: { senhaHash: novaSenhaHash, senhaProvisoria: false },
      });

      return res.status(200).json({
        mensagem: "Senha alterada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao trocar senha:", erro);
      return res.status(500).json({ error: "Erro interno ao trocar senha." });
    }
  }
}

export default new AuthController();
