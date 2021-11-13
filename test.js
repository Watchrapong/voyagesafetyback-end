// const user = require("./models/user");
// const bcrypt = require("bcryptjs");
const {
  sendVerify,
  sendResetPassword,
  sendConfirmBooking,
} = require("./controller/mailsender");

// let sdbm = (str) => {
//     let arr = str.split("");
//     return arr.reduce(
//       (hashCode, currentVal) =>
//         (hashCode =
//           currentVal.charCodeAt(0) +
//           (hashCode << 6) +
//           (hashCode << 16) -
//           hashCode),
//       0
//     );
//   };

//   function main  ()  {
//     var bigNumArry = new Array(' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion');
//     for (let i = 0; i < bigNumArry.length; i++) {
//         let UserId = Math.abs(sdbm(bigNumArry[i]+"@gmail.com"))
//     let result =  user.create({
//       UserId: UserId,
//       FirstName: bigNumArry[i],
//       LastName: bigNumArry[i],
//       Email: bigNumArry[i]+"@gmail.com",
//       CitizenId: i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i,
//       Telno: i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i+""+i,
//       Gender: 1,
//       Password: bcrypt.hashSync("11111111", 8),
//       Status: false, //check on blockchain
//       Verify: true,
//     });
//     } 
//   }
  function main  ()  {
    sendConfirmBooking("glaa656@hotmail.co.th","QqqQQ","wwwwwww","2313131313","2021-11-12");
  }

 
    