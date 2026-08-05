import nodemailer from "nodemailer";

import dns from "node:dns";

dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  console.log("SMTP DNS:", addresses);
});

export const transporter = nodemailer.createTransport({
  //service: "gmail",
  /*host: "smtp.gmail.com",
  port: 587,
  secure: false,*/
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
}
