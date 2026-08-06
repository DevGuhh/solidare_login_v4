import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to, subject, html) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Suporte <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
