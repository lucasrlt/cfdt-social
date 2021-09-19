import nodemailer from "nodemailer";
import strings from "../../strings.json";

export const sendPassword = async (email, username, password) => {
  let transporter = nodemailer.createTransport({
    host: "mail51.lwspanel.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ADDRESS, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  console.log({
    auth: {
      user: process.env.MAIL_ADDRESS, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: '"CFDT Rhône" <comptes@cfdt-services69.fr>',
    to: email,
    subject: strings.mails.pwd_register.SUBJECT,
    text: strings.mails.pwd_register.BODY.replace(
      "{PASSWORD}",
      password
    ).replace("{USERNAME}", username),
  });

  return true;
};
