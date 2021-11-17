const express = require("express");
const router = express.Router();
const user = require("./models/user");
const constants = require("./constant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const multer = require("multer");
const checkAuthen = require("./middleware/authentication");
const FirebaseApp = require("./filebase_connection");
const {
  sendVerify,
  sendVerifySuccess,
  sendResetPassword,
  sendConfirmBooking,
  sendPasswordChange,
  sendUpdateProfile,
} = require("./controller/mailsender");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("voyageSafetySecretKey");
const axios = require("axios");
const { apiBlockChain, server } = require("./constant");

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const storage = FirebaseApp.storage();
const bucket = storage.bucket();

router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  let result = await user.findOne({ where: { Email: Email } });
  if (result != null) {
    if (result.Verify == true) {
      if (bcrypt.compareSync(Password, result.Password)) {
        const UserId = result.UserId;
        const token = jwt.sign({ UserId }, "voyage");
        axios
          .post(`${apiBlockChain}/${server.VACCINATION}/${result.CitizenId}`)
          .then(async (response) => {
            let data = response.data.result;
            await user.update(
              { Status: data.haveVaccine },
              { where: { UserId: UserId } }
            );
          })
          .catch((error) => {
            console.error(error);
          });
        res.json({
          result: constants.kResultOk,
          // message: JSON.stringify({
          token: token,
          // }),
        });
      } else {
        res.json({
          result: constants.kResultNok,
          message: "Incorrect password",
        });
      }
    } else {
      res.json({ result: constants.kResultNok, message: "Not verify" });
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
    console.log(error);
    res.json({ result: {}, error: { status: 404, message: "Not Found" } });
  }
});

router.post("/confirmbooking", async (req, res) => {
  let data = req.body;
  axios
    .post(`${apiBlockChain}/${server.VACCINATION}/${data.CitizenId}`)
    .then((response) => {
      var data = response.data;
      if (data.result.haveVaccine == true) {
        console.log("Success");
        sendConfirmBooking(
          req.body.Email,
          req.body.FirstName,
          req.body.LastName,
          req.body.Name,
          req.body.Date
        );
        res.json({
          result: constants.kResultOk,
        });
      } else {
        console.log("Fail");
        console.log(error);
        res.json({ result: constants.kResultNok, error: error });
      }
    })
    .catch((error) => {
      res.json({ result: constants.kResultNok, error: error });
    });
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
  axios
    .post(`${apiBlockChain}/${server.VACCINATION}/${req.body.CitizenId}`)
    .then(async (response) => {
      try {
        let UserId = Math.abs(sdbm(req.body.Email));
        let result = await user.create({
          UserId: UserId,
          FirstName: req.body.FirstName,
          LastName: req.body.LastName,
          Email: req.body.Email,
          CitizenId: req.body.CitizenId,
          Telno: req.body.Telno,
          Gender: req.body.Gender,
          Password: bcrypt.hashSync(req.body.Password, 8),
          Status: response.data.result.haveVaccine, //check on blockchain
          Verify: false,
        });
        console.log("Success");
        let key = cryptr.encrypt(UserId);
        sendVerify(req.body.host, req.body.Email, key);
        res.json({
          result: constants.kResultOk,
          message: JSON.stringify(result),
        });
      } catch (error) {
        console.log("Fail");
        console.log(error);
        res.json({
          result: constants.kResultNok,
          message: JSON.stringify(error),
        });
      }
    })
    .catch((error) => {
      console.log("Vaccine Fail");
      console.log(error);
      res.json({
        result: constants.kResultNok,
        message: JSON.stringify(error),
      });
    });
});

//Update
router.put("/update", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      // if(err){
        try {
          let result = await user.update(fields, {
        where: { UserId: fields.UserId },
      });
      sendUpdateProfile(fields.Email)
      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result),
      });
        } catch (error) {
          res.json({ result: constants.kResultNok });
        }
      
    // } else{
    //   res.json({ result: constants.kResultNok });
    // }
    });
  } catch (error) {
    res.json({ result: constants.kResultNok });
  }
});

router.put("/verifyupdate", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      // if(err){
        try {
          let result = await user.update(fields, {
        where: { UserId: fields.UserId },
      });
      sendVerifySuccess(fields.Email)
      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result),
      });
        } catch (error) {
          console.log(error)
          res.json({ result: constants.kResultNok });
        }
      
    // } else{
    //   res.json({ result: constants.kResultNok });
    // }
    });
  } catch (error) {
    res.json({ result: constants.kResultNok });
  }
});

router.put("/upload", uploader.single("image"), async (req, res) => {
  // const name = req.body.name;
  // const folder = 'ProfileImage';
  // const fileName = `${folder}/${name}.jpeg`
  // const fileUpload = bucket.file(fileName);
  // const blobStream = fileUpload.createWriteStream({
  //   metadata: {
  //     contentType: req.file.mimetype
  //   },
  //   // filelocation: {
  //   //   accessToken: access
  //   // }
  // });

  // blobStream.on('error', (err) => {
  //   res.status(405).json(err);
  // });

  // blobStream.on('finish', () => {
  //   // res.status(200).send('Upload complete!');
  //   res.json({result: `https://firebasestorage.googleapis.com/v0/b/feisty-tempo-311112.appspot.com/o/ProfileImage%2F${name}_400x300.jpeg?`})
  // });

  // blobStream.end(req.file.buffer);
  try {
    if (!req.file) {
      res.status(400).send("Error, could not upload file");
    }

    // Create new blob in the bucket referencing the file
    const name = req.body.name;
    const folder = "ProfileImage";
    const fileName = `${name}.jpeg`;
    const fileUpload = bucket.file(`${folder}/${fileName}`);
    const resizeFileName = `${name}_200x200.jpeg`;
    const pathImg = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${folder}%2F${encodeURI(resizeFileName)}?alt=media`;
    var fields = { UserId: name, pathImg };
    user.update(fields, {
      where: { UserId: fields.UserId },
    });
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // blobStream.on('error', (err) => next(err));

    // blobStream.on("finish", () => {
    //   // Assembling public URL for accessing the file via HTTP
    //   const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
    //     bucket.name
    //   }/o/${folder}%2F${encodeURI(resizeFileName)}?alt=media`;

    //   // Return the file name and its public URL

    //   res
    //     .status(200)
    //     .send({ fileName: req.file.originalname, fileLocation: publicUrl });
    // });

    // When there is no more data to be consumed from the stream

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.log(error);
    res.status(400).send(`Error, could not upload file: ${error}`);
  }
});

router.put("/resetpassword", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields) => {
      let bcryptPass = bcrypt.hashSync(fields.Password, 8);
      let result = await user.update(
        { Password: bcryptPass },
        {
          where: { UserId: fields.UserId },
        }
      );
      sendPasswordChange(fields.Email);
      res.json({
        //Password: fields
        result: constants.kResultOk,
        message: JSON.stringify(result),
      });
    });
  } catch (error) {
    console.log(error);
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

router.post("/resetpassword", async (req, res) => {
  let result = await user.findOne({ where: { Email: req.body.Email } });
  if (!result) {
    res.json({ result: constants.kResultNok, message: "Result null" });
  } else {
    sendResetPassword(req.body.host, req.body.Email, req.body.host);
    res.json({ result: constants.kResultOk });
  }
});

router.put("/updatepassword", async (req, res) => {
  try {
    let bcryptPass = bcrypt.hashSync(req.body.Password, 8);
    let result = await user.update(
      { Password: bcryptPass },
      { where: { Email: req.body.Email } }
    );
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    console.log(error);
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

router.put("/updatevaccine", async (req, res) => {
  try {
    let result = await user.update(
      { Status: true },
      { where: { CitizenId: req.body.CitizenId } }
    );
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

module.exports = router;
