import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { generateToken } from "../utils/generateToken.js";
import { PrismaClient } from "@prisma/client";
import { use } from "react";
import { sendMail } from "../config/mailer.js";

// ======================================================
// CONFIGURAÇÕES DA RECUPERAÇÃO DE SENHA
// ======================================================

const TEMPO_EXPIRACAO_TOKEN_MINUTOS = 30;

const MENSAGEM_RECUPERACAO =
  "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";

// ======================================================
// ESCAPAR TEXTO PARA USO SEGURO NO HTML DO E-MAIL
// ======================================================

function escaparHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================================================
// CRIAR TRANSPORTADOR DE E-MAIL
// ======================================================

function criarTransportadorEmail() {
  const porta = Number(process.env.EMAIL_PORT || 587);

  const configuracoesObrigatorias = [
    process.env.EMAIL_HOST,
    process.env.EMAIL_USER,
    process.env.EMAIL_PASSWORD,
  ];

  const configuracaoIncompleta = configuracoesObrigatorias.some(
    (valor) => !valor,
  );

  if (configuracaoIncompleta) {
    throw new Error(
      "As configurações de e-mail não foram definidas no arquivo .env.",
    );
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,

    port: porta,

    secure: porta === 465,

    auth: {
      user: process.env.EMAIL_USER,

      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// ======================================================
// ENVIAR E-MAIL DE RECUPERAÇÃO
// ======================================================

async function enviarEmailRecuperacao({ nome, email, token }) {
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5500"
  ).replace(/\/$/, "");

  /*
   * O token original é enviado somente no link.
   * No banco será salvo apenas o hash.
   */
  const linkRecuperacao = `${frontendUrl}/views/redefinirSenha.html?token=${encodeURIComponent(token)}`;

  const transportador = criarTransportadorEmail();

  const nomeSeguro = escaparHtml(nome || "Usuário");

  const remetente =
    process.env.EMAIL_FROM ||
    `"Instituto Solidare" <${process.env.EMAIL_USER}>`;

  await transportador.sendMail({
    from: remetente,

    to: email,

    subject: "Redefinição de senha | Instituto Solidare",

    text: `
Olá, ${nome || "usuário"}.

Recebemos uma solicitação para redefinir a senha da sua conta no Instituto Solidare.

Acesse o link abaixo para criar uma nova senha:

${linkRecuperacao}

Este link é válido por ${TEMPO_EXPIRACAO_TOKEN_MINUTOS} minutos e poderá ser utilizado apenas uma vez.

Se você não solicitou essa alteração, ignore este e-mail.

Instituto Solidare
    `.trim(),

    html: `
<!DOCTYPE html>
<html lang="pt-BR">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Redefinição de senha
  </title>

</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f4f0eb;
    font-family: Arial, Helvetica, sans-serif;
    color: #321015;
  "
>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width: 100%;
      background: #f4f0eb;
      padding: 32px 16px;
    "
  >

    <tr>

      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 18px 50px rgba(70, 10, 20, 0.12);
          "
        >

          <tr>

            <td
              style="
                height: 8px;
                background: linear-gradient(
                  90deg,
                  #5f000e,
                  #8f1528,
                  #c29a45
                );
              "
            ></td>

          </tr>

          <tr>

            <td
              style="
                padding: 40px 36px 20px;
                text-align: center;
              "
            >

              <div
                style="
                  width: 70px;
                  height: 70px;
                  margin: 0 auto 22px;
                  border-radius: 20px;
                  background: #5f000e;
                  color: #ffffff;
                  font-size: 30px;
                  line-height: 70px;
                "
              >
                🔐
              </div>

              <p
                style="
                  margin: 0 0 8px;
                  color: #9a702c;
                  font-size: 13px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                "
              >
                Instituto Solidare
              </p>

              <h1
                style="
                  margin: 0;
                  color: #421019;
                  font-size: 28px;
                  line-height: 1.25;
                "
              >
                Redefinição de senha
              </h1>

            </td>

          </tr>

          <tr>

            <td
              style="
                padding: 10px 36px 38px;
              "
            >

              <p
                style="
                  margin: 0 0 18px;
                  color: #503a3e;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >
                Olá, <strong>${nomeSeguro}</strong>.
              </p>

              <p
                style="
                  margin: 0 0 26px;
                  color: #6f5a5e;
                  font-size: 15px;
                  line-height: 1.7;
                "
              >
                Recebemos uma solicitação para redefinir a senha
                da sua conta. Clique no botão abaixo para criar
                uma nova senha.
              </p>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >

                <tr>

                  <td align="center">

                    <a
                      href="${linkRecuperacao}"
                      style="
                        display: inline-block;
                        padding: 15px 28px;
                        border-radius: 12px;
                        background: #5f000e;
                        color: #ffffff;
                        font-size: 15px;
                        font-weight: 700;
                        text-decoration: none;
                      "
                    >
                      Redefinir minha senha
                    </a>

                  </td>

                </tr>

              </table>

              <div
                style="
                  margin-top: 30px;
                  padding: 18px;
                  border-radius: 12px;
                  background: #faf6f1;
                  border: 1px solid #eadfd3;
                "
              >

                <p
                  style="
                    margin: 0;
                    color: #735d61;
                    font-size: 13px;
                    line-height: 1.6;
                    text-align: center;
                  "
                >
                  Este link é válido por
                  <strong>${TEMPO_EXPIRACAO_TOKEN_MINUTOS} minutos</strong>
                  e poderá ser utilizado somente uma vez.
                </p>

              </div>

              <p
                style="
                  margin: 26px 0 0;
                  color: #8a7679;
                  font-size: 13px;
                  line-height: 1.6;
                  text-align: center;
                "
              >
                Se você não solicitou a redefinição de senha,
                ignore esta mensagem. Sua senha continuará a mesma.
              </p>

            </td>

          </tr>

          <tr>

            <td
              style="
                padding: 22px 30px;
                background: #421019;
                color: #ffffff;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  opacity: 0.82;
                "
              >
                © 2026 Instituto Solidare.
                Todos os direitos reservados.
              </p>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
    `.trim(),
  });
}

class AuthController {
  async login(req, res) {
    try {
      const { email, senha, senhaHash } = req.body;

      const senhaRecebida = senha || senhaHash;

      const emailNormalizado = email ? email.trim().toLowerCase() : "";

      if (!emailNormalizado || !senhaRecebida) {
        return res.status(400).json({
          error: "E-mail e senha são obrigatórios.",
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: {
          email: emailNormalizado,
        },

        select: {
          id: true,
          nome: true,
          email: true,
          senhaHash: true,
          senhaProvisoria: true,
          role: true,
          ativo: true,
          instituicaoId: true,
        },
      });

      if (!usuario) {
        return res.status(401).json({
          error: "E-mail ou senha inválidos.",
        });
      }

      if (!usuario.ativo) {
        return res.status(403).json({
          error: "Este usuário está inativo. Procure um administrador.",
        });
      }

      if (!usuario.senhaHash) {
        console.error(
          `Usuário de ID ${usuario.id} está sem senhaHash no banco.`,
        );

        return res.status(500).json({
          error: "O usuário está sem uma senha configurada.",
        });
      }

      const senhaValida = await bcrypt.compare(
        senhaRecebida,
        usuario.senhaHash,
      );

      if (!senhaValida) {
        return res.status(401).json({
          error: "E-mail ou senha inválidos.",
        });
      }

      const token = generateToken(usuario.id, res, usuario.role);

      return res.status(200).json({
        status: "sucesso",
        mensagem: "Login realizado com sucesso.",
        token,
        senhaProvisoria: usuario.senhaProvisoria,
        role: usuario.role,
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
          token,
        },
      });
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);

      return res.status(500).json({
        error: "Erro interno ao realizar login.",
      });
    }
  }

  async logout(req, res) {
    try {
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

  async alterarSenha(req, res) {
    try {
      const usuarioId = req.userId;
      const { senhaAtual, novaSenha, confirmarSenha } = req.body;

      if (!usuarioId) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        return res.status(400).json({
          error: "Preencha todos os campos.",
        });
      }

      if (typeof novaSenha !== "string" || novaSenha.length < 6) {
        return res.status(400).json({
          error: "A nova senha deve possuir pelo menos 6 caracteres.",
        });
      }

      if (novaSenha !== confirmarSenha) {
        return res.status(400).json({
          error: "A confirmação da senha não corresponde à nova senha.",
        });
      }

      if (senhaAtual === novaSenha) {
        return res.status(400).json({
          error: "A nova senha deve ser diferente da senha atual.",
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: {
          id: Number(usuarioId),
        },
      });

      if (!usuario) {
        return res.status(404).json({
          error: "Usuário não encontrado.",
        });
      }

      if (!usuario.ativo) {
        return res.status(403).json({
          error: "Este usuário está inativo.",
        });
      }

      if (!usuario.senhaHash) {
        return res.status(500).json({
          error: "O usuário está sem uma senha configurada.",
        });
      }

      const senhaAtualValida = await bcrypt.compare(
        senhaAtual,
        usuario.senhaHash,
      );

      if (!senhaAtualValida) {
        return res.status(401).json({
          error: "A senha atual está incorreta.",
        });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await prisma.usuario.update({
        where: {
          id: usuario.id,
        },

        data: {
          senhaHash: novaSenhaHash,
          senhaProvisoria: false,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      });

      return res.status(200).json({
        status: "sucesso",
        mensagem: "Senha alterada com sucesso.",
      });
    } catch (erro) {
      console.error("Erro ao alterar senha:", erro);

      return res.status(500).json({
        error: "Erro interno ao alterar a senha.",
      });
    }
  }
  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      const user = await prisma.usuario.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

      await prisma.resetPasswordToken.create({
        data: { token: resetToken, usuarioId: user.id, expiresAt },
      });

      await sendMail(
        user.email,
        "Redefinição de senha",
        `
        <h2> Olá, ${user.nome}</h2>
        <p>Você solicitou redefinição de senha. Clique no link abaixo para redefinir</p>
        <a href="http://localhost:3000/auth/reset-password/${resetToken}">
          Redefinir minha senha
        </a>

        <p>Esse link expira em 15 minutos.</p>
        `,
      );

      return res.json({ message: "E-mail de redefinição enviado!" });
    } catch (error) {
      console.error("Erro em requestPasswordReset:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const resetToken = await prisma.resetPasswordToken.findUnique({
        where: {
          token,
        },
      });

      if (!resetToken || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.usuario.update({
        where: { id: resetToken.usuarioId },
        data: { senhaHash: hashedPassword },
      });

      await prisma.resetPasswordToken.delete({ where: { id: resetToken.id } });
      return res.json({ message: "Senha redefinida com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

const solicitarRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "Informe um e-mail válido.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailNormalizado || !regexEmail.test(emailNormalizado)) {
      return res.status(400).json({
        error: "Informe um e-mail válido.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        email: emailNormalizado,
      },

      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(200).json({
        status: "sucesso",
        mensagem: MENSAGEM_RECUPERACAO,
      });
    }

    const tokenOriginal = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(tokenOriginal)
      .digest("hex");

    const tokenExpiraEm = new Date(
      Date.now() + TEMPO_EXPIRACAO_TOKEN_MINUTOS * 60 * 1000,
    );

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },

      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: tokenExpiraEm,
      },
    });

    try {
      await enviarEmailRecuperacao({
        nome: usuario.nome,
        email: usuario.email,
        token: tokenOriginal,
      });
    } catch (erroEmail) {
      await prisma.usuario.update({
        where: {
          id: usuario.id,
        },

        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      });

      throw erroEmail;
    }

    return res.status(200).json({
      status: "sucesso",

      mensagem: MENSAGEM_RECUPERACAO,
    });
  } catch (erro) {
    console.error("Erro ao solicitar recuperação de senha:", erro);

    return res.status(500).json({
      error:
        "Não foi possível enviar o link de recuperação. Tente novamente mais tarde.",
    });
  }
};

const recuperarSenha = solicitarRecuperacao;

// ======================================================
// REDEFINIR SENHA USANDO O TOKEN DO LINK
// ======================================================

const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha, confirmarSenha } = req.body;

    // ==================================================
    // VALIDAÇÃO DOS CAMPOS
    // ==================================================

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "O link de recuperação é inválido.",
      });
    }

    if (!novaSenha || !confirmarSenha) {
      return res.status(400).json({
        error: "Informe e confirme a nova senha.",
      });
    }

    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
      return res.status(400).json({
        error: "A nova senha deve possuir pelo menos 6 caracteres.",
      });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({
        error: "A confirmação da senha não corresponde à nova senha.",
      });
    }

    // ==================================================
    // GERA O HASH DO TOKEN RECEBIDO
    // ==================================================

    const tokenHash = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    // ==================================================
    // CRIPTOGRAFA A NOVA SENHA
    // ==================================================

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // ==================================================
    // ATUALIZA SOMENTE SE O TOKEN FOR VÁLIDO
    // ==================================================

    /*
     * updateMany deixa a validação e a atualização
     * em uma única operação.
     *
     * Isso evita que o mesmo token seja utilizado duas
     * vezes simultaneamente.
     */
    const resultado = await prisma.usuario.updateMany({
      where: {
        resetTokenHash: tokenHash,

        resetTokenExpiresAt: {
          gt: new Date(),
        },

        ativo: true,
      },

      data: {
        senhaHash: novaSenhaHash,

        senhaProvisoria: false,

        resetTokenHash: null,

        resetTokenExpiresAt: null,
      },
    });

    // ==================================================
    // TOKEN INVÁLIDO OU EXPIRADO
    // ==================================================

    if (resultado.count === 0) {
      return res.status(400).json({
        error: "O link de recuperação é inválido, já foi utilizado ou expirou.",
      });
    }

    // ==================================================
    // RESPOSTA DE SUCESSO
    // ==================================================

    return res.status(200).json({
      status: "sucesso",

      mensagem: "Senha redefinida com sucesso. Você já pode entrar no sistema.",
    });
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro);

    return res.status(500).json({
      error: "Erro interno ao redefinir a senha.",
    });
  }
};

export default new AuthController();

export { solicitarRecuperacao, recuperarSenha, redefinirSenha };
