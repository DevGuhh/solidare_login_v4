import { Resend } from "resend";
import "dotenv/config";

console.log("=== CONFIGURAÇÃO DE E-MAIL CARREGADA ===");
console.log("Arquivo:", import.meta.url);

console.log(
  "RESEND_API_KEY:",
  process.env.RESEND_API_KEY ? "DEFINIDA ✅" : "NÃO DEFINIDA ❌"
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to, subject, html) {
  try {
    console.log("====================================");
    console.log("Iniciando envio de e-mail...");
    console.log("Destinatário:", to);

    const { data, error } = await resend.emails.send({
      from: `Suporte <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    console.log("E-mail enviado com sucesso!");
    console.log("ID:", data?.id);

    return data;

  } catch (error) {

    console.error("====================================");
    console.error("Erro ao enviar e-mail");
    console.error(error);

    throw error;
  }
}