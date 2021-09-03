const express = require("express");
const router = express.Router();
const user = require("./models/user");
const constants = require("./constant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const checkAuthen = require("./middleware/authentication");

router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  let result = await user.findOne({ where: { Email: Email } });
  if (result != null) {
    if (bcrypt.compareSync(Password, result.Password)) {
      const UserId = result.UserId;
      const token = jwt.sign({ UserId }, "voyage", { expiresIn: "10h" });
      res.json({
        result: constants.kResultOk,
        // message: JSON.stringify({
        token: token,
        // }),
      });
      console.log(token);
    } else {
      res.json({ result: constants.kResultNok, message: "Incorrect password" });
    }
  } else {
    res.json({ result: constants.kResultNok, message: "Incorrect username" });
  }
});

router.get("/info", checkAuthen, (req, res) => {
  const { userData } = req;
  if (Object.entries(userData).length !== 0) {
    user
      .findOne({ where: { UserId: userData.UserId } })
      .then((result) => {
        res.json({ result, error: {} });
      })
      .catch((err) => {
        res.json({
          result: {},
          error: { status: 404, message: "Not Found" },
        });
      });
  } else {
    res.json({ result: {}, error: { status: 404, message: "Not Found" } });
  }
});

router.post("/register", async (req, res) => {
  let sdbm = (str) => {
    let arr = str.split("");
    return arr.reduce(
      (hashCode, currentVal) =>
        (hashCode =
          currentVal.charCodeAt(0) +
          (hashCode << 6) +
          (hashCode << 16) -
          hashCode),
      0
    );
  };
  try {
    let result = await user.create({
      UserId: Math.abs(sdbm(req.body.Email)),
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Email: req.body.Email,
      CitizenId: req.body.CitizenId,
      Telno: req.body.Telno,
      Gender: req.body.Gender,
      Password: bcrypt.hashSync(req.body.Password, 8),
      Status: false, //check on blockchain
    });
    console.log("Success");
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    console.log("Fail");
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

//Update
router.put("/update", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      let result = await user.update(fields, {
        where: { UserId: fields.UserId },
      });
      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result),
      });
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

//ResetPassword
router.put("/resetPassword", async (req, res) => {
  try {

  }catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
})

module.exports = router;
