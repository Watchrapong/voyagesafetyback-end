const nodemailer = require('nodemailer');
const {verify,resetPassword} = require('../view/Page');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('voyageSafetySecretKey');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'voyagesafety@gmail.com',
      pass: 'voyagesafety01'
    }
  });

  function sendVerify(link, email, subject, key)  {
  const mailOptions = {
    from: 'voyagesafety@gmail.com',
    to: email,
    subject: subject,
    html: verify(link, email, key)
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Verify sent: ' + info.response);
    }
  });
  }

  function sendResetPassword(link, email )  {
    const key = cryptr.encrypt(email);
    const fulllink = `https://${link}/resetpassword/${key}`;
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
      to: email,
      subject: "Reset password",
      html: resetPassword(fulllink, email)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Resetpassword sent: ' + info.response);
      }
    });
  }

  module.exports = { sendVerify, sendResetPassword }