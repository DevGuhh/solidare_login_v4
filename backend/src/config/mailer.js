import nodemailer from "nodemailer";
import dns from "node:dns";

/*dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  console.log("SMTP DNS:", addresses);
});

export const transporter = nodemailer.createTransport({
  //service: "gmail",
  /*host: "smtp.gmail.com",
  port: 587,
  secure: false,
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    servername: "smtp.gmail.com"
  }
});

export async function sendMail(to, subject, html) {
  try {
    await transporter.verify();
    console.log("SMTP conectado!");

    (await transporter.sendMail({
      from: `"Suporte" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }),
      console.log("E-mail enviado com sucesso!"));
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }
}*/

async function verificarDNS() {
  try {
    const addresses = await dns.lookup("smtp.gmail.com", { all: true });
    console.log("SMTP DNS:", addresses);
  } catch (err) {
    console.error("Erro ao resolver DNS:", err);
  }
}

await verificarDNS();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "DEFINIDA ✅" : "NÃO DEFINIDA ❌"
);

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,

  logger: true,
  debug: true,

  tls: {
    servername: "smtp.gmail.com",
    rejectUnauthorized: true,
  },
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

    console.log("E-mail enviado!");
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
