import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()

export default function sendEmail(to, subject, text, html){
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER_EMAIL,
    pass:process.env.EMAIL_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    // from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    from:process.env.USER_EMAIL,
    to,
    // to: "bar@example.com, baz@example.com", // list of receivers
    subject,
    // subject: "Hello ✔", // Subject line
    text,
    // text: "Hello world?", // plain text body
    html: html
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  return info
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);
}

