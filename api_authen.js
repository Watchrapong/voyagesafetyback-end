const express = require("express");
const router = express.Router();
const user = require("./models/user");
const constants = require("./constant");
const bcrypt = require("bcryptjs");

router.post("/login", async(req, res)=>{
    const { Email, Password } = req.body;

  let result = await user.findOne({ where: { Email: Email } });
  console.log(result)
  console.log("Password : "+Password)
  console.log("result Password : "+result.Password)
  if (result != null) {
    if (bcrypt.compareSync(Password, result.Password)) {
      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result )
      });
    } else {
      res.json({ result: constants.kResultNok, message: "Incorrect password" });
    }
  } else {
    res.json({ result: constants.kResultNok, message: "Incorrect username" });
  }
});

router.post('/register', async (req, res) =>{
    
        let sdbm = str => {
            let arr = str.split('');
            return arr.reduce(
              (hashCode, currentVal) =>
                (hashCode = currentVal.charCodeAt(0) + (hashCode << 6) + (hashCode << 16) - hashCode),
              0
            );
          };
          try {
        req.body.UserId = Math.abs(sdbm(req.body.Email));
        req.body.Password = bcrypt.hashSync(req.body.Password, 8);
        req.body.Status="true";//check on blockchain
        let result = await user.create(req.body);
        console.log("Success")
        res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
      } catch (error) {
          console.log("Fail")
        res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
      }
    
  });

module.exports = router;