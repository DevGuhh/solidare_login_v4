import nodemailer from "nodemailer";
import "dotenv/config";

console.log("=== CONFIGURAÇÃO DE E-MAIL CARREGADA ===");
console.log("Arquivo:", import.meta.url);

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "DEFINIDA ✅" : "NÃO DEFINIDA ❌"
);

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  requireTLS: true,
});


export async function sendMail(to, subject, html) {
  try {
    console.log("====================================");
    console.log("Iniciando envio de e-mail...");
    console.log("Destinatário:", to);

    console.log("Verificando conexão SMTP...");

    await transporter.verify();

    console.log("SMTP conectado com sucesso!");

    console.log("Enviando e-mail...");

    const info = await transporter.sendMail({
      from: `"Suporte" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("E-mail enviado com sucesso!");
    console.log("Message ID:", info.messageId);
    console.log("Resposta SMTP:", info.response);

    return info;

  } catch (error) {

    console.error("====================================");
    console.error("Erro ao enviar e-mail");
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("Comando:", error.command);
    console.error(error);

    throw error;
  }
}