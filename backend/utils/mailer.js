import nodemailer from "nodemailer";
import strings from "../strings.json";

export const sendPassword = async (email, username, password) => {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"CFDT" <cfdt@gmail.com>',
    to: email,
    subject: strings.mails.pwd_register.SUBJECT,
    text: strings.mails.pwd_register.BODY.replace(
      "{PASSWORD}",
      password
    ).replace("{USERNAME}", username),
  });

  console.log("-----MAIL URL: " + nodemailer.getTestMessageUrl(info));
};
