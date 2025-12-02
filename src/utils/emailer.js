const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, html, text }) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html,
      text
    });

    console.log("Resend Email sent:", response);
    return response;
  } catch (err) {
    console.error("Resend email error:", err);
    throw err;
  }
}

module.exports = { sendMail };
