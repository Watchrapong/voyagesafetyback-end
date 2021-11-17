const nodemailer = require('nodemailer');
const {verify, verifySuccess, resetPassword, confirmBooking, PasswordChange, updateProfile} = require('../view/Page');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('voyageSafetySecretKey');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'voyagesafety@gmail.com',
      pass: 'voyagesafety01'
    }
  });

  function sendVerify(link, email, key)  {
  const mailOptions = {
    from: 'voyagesafety@gmail.com',
    to: email,
    subject: "ยืนยันอีเมล",
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

  function sendVerifySuccess(email) {
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
    to: email,
    subject: "ยืนยันอีเมล",
    html: verifySuccess(email)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Verify sent: ' + info.response);
      }
    });
  }

  function sendConfirmBooking(email,firstName,lastName,Name,date) {
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
      to: email,
      subject: "ข้อมูลการจอง",
      html: confirmBooking(firstName,lastName,Name,date)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('ConfirmBooking sent: ' + info.response);
      }
    });
  }

  function sendResetPassword(link, email )  {
    const key = cryptr.encrypt(email);
    const fulllink = `https://${link}/resetpassword/${key}`;
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
      to: email,
      subject: "แก้ไขรหัสผ่าน",
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

  function sendPasswordChange(email)  {
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
      to: email,
      subject: "รหัสผ่านได้รับการแก้ไข",
      html: PasswordChange(email)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('password change sent: ' + info.response);
      }
    });
  }

  function sendUpdateProfile(email)  {
    const mailOptions = {
      from: 'voyagesafety@gmail.com',
      to: email,
      subject: "ข้อมูลส่วนตัวได้รับการแก้ไข",
      html: updateProfile(email)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('update profile sent: ' + info.response);
      }
    });
  }

  module.exports = { sendVerify, sendVerifySuccess, sendConfirmBooking, sendResetPassword, sendPasswordChange, sendUpdateProfile }