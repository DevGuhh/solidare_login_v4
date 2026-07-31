import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendMail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: `"Suporte" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Redefinição de senha | Instituto Solidare",
            html,
        }),
        console.log("E-mail enviado com sucesso!")
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error)
        throw error;
    }
}