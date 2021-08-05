import nodemailer from "nodemailer";
import strings from "../strings.json";

export const sendPassword = async (email, username, password) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
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

  let info = await transporter.sendMail({
    from: '"CFDT Rhône" <cfdt69.services.app@gmail.com>',
    to: email,
    subject: strings.mails.pwd_register.SUBJECT,
    text: strings.mails.pwd_register.BODY.replace(
      "{PASSWORD}",
      password
    ).replace("{USERNAME}", username),
  });

  return true;
};
