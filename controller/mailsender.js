const nodemailer = require('nodemailer');
const {verify} = require('../view/Page');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'voyagesafety@gmail.com',
      pass: 'voyagesafety01'
    }
  });

  function send(link, email, subject, key)  {
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
      console.log('Email sent: ' + info.response);
    }
  });
  }

  module.exports = send;