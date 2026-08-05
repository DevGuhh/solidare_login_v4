import "dotenv/config";
import nodemailer from "nodemailer";

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS ? "Senha OK" : "Sem senha");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

try {
  await transporter.verify();
  console.log("SMTP OK");
} catch (err) {
  console.error(err);
}