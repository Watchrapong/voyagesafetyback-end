const {
  sendVerify,
  sendResetPassword,
  sendConfirmBooking,
} = require("./controller/mailsender");

  function main  ()  {
    sendConfirmBooking("glaa656@hotmail.co.th","QqqQQ","wwwwwww","2313131313","2021-11-12");
  }

  main();

 
    