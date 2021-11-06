const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const Establishment = require("./models/establishment");
const image = require("./models/image");
const op = Sequelize.Op;
const constants = require("./constant");
const formidable = require("formidable");
const multer = require("multer");
const FirebaseApp = require("./filebase_connection");
const { findAllStaff, Staff } = require("./models/staff");
const Owner = require("./models/owner");
const User = require("./models/user");
const axios = require("axios");
const { apiBlockChain, server } = require("./constant");

const uploader = multer({
  storage: multer.memoryStorage(),
});

const storage = FirebaseApp.storage();
const bucket = storage.bucket();

//Gete All
router.get("/establishment", async (req, res) => {
  let result = await Establishment.findAll();
  res.json(result);
});

//Get by Keyword
router.get("/establishment/keyword/:keyword", async (req, res) => {
  const { keyword } = req.params;
  let result = await Establishment.findAll({
    where: { Name: { [op.like]: `%${keyword}%` } },
  });
  res.json(result);
});

//Get by category
router.get("/establishment/category/:category", async (req, res) => {
  const { category } = req.params;
  let result = await Establishment.findAll({
    where: { SubCategoryId: { [op.eq]: category } },
  });
  res.json(result);
});

//Get one
router.get("/detail/:EstId", async (req, res) => {
  const EstId = req.params.EstId;
  let result = await Establishment.findOne({
    where: { EstId: EstId },
  });
  let arrImg = await image.findAll({ where: { EstId: EstId } });
  if (result && arrImg) {
    res.json({ result, arrImg });
  } else {
    res.json();
  }
});

//Add
router.post("/establishment", uploader.array("images", 3), async (req, res) => {
  try {
    const collection = req.files;
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
    let EstId = Math.abs(sdbm(req.body.Name));
    const folder = "EstablishmentImage";
    const mainFileName = `${EstId}_0_700x350.jpeg`;
    const pathImg = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${folder}%2F${encodeURI(mainFileName)}?alt=media`;
    let result = await Establishment.create({
      EstId: EstId,
      Name: req.body.Name,
      Description: req.body.Description,
      Address: req.body.Address,
      District: req.body.District,
      Province: req.body.Province,
      PostCode: req.body.PostCode,
      Lat: req.body.Lat,
      Lng: req.body.Lng,
      SubCategoryId: req.body.SubCategoryId,
      pathImg: pathImg,
    });
    axios
      .post(`${apiBlockChain}/${server.VACCINATION}/${req.body.CitizenId}`)
      .then(async (response) => {
        let vaccineName1 = response.data.result.vaccineName1;
        let vaccineName2 = response.data.result.vaccineName2;
        console.log(vaccineName1);
        let userId = req.body.Owner;
        let ownerResult = await Owner.create({
          OwnerId: userId,
          UserId: userId,
          EstId: EstId,
          vaccineName1: vaccineName1,
          vaccineName2: vaccineName2,
        });
        console.log("owner success");
      })
      .catch((error) => {
        res.json({
          result: constants.kResultNok,
          message: JSON.stringify(error),
        });
      });
    for (let i = 0; i < collection.length; i++) {
      const element = collection[i];
      const name = EstId;
      const fileName = `${name}_${i}.jpeg`;
      const fileUpload = bucket.file(`${folder}/${fileName}`);
      const resizeFileName = `${name}_${i}_700x350.jpeg`;
      const pathImg = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${folder}%2F${encodeURI(resizeFileName)}?alt=media`;
      var fields = { ImgId: name + i, EstId: EstId, Img: pathImg };
      image.create(fields);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: element.mimetype,
        },
      });
      blobStream.end(element.buffer);
    }
    console.log("upload success");
    res.json({
      result: constants.kResultOk,
      message: JSON.stringify(result),
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

//see my Establishment
router.get('/establishment/owner/:UserId', async (req, res) => {
  try {
    const UserId = req.params.UserId;
  let owner = await Owner.findOne({ where: { UserId }})
  const EstId = owner.EstId;
  let result = await Establishment.findOne({
    where: { EstId: EstId },
  });
  let arrImg = await image.findAll({ where: { EstId: EstId } });
  if (result && arrImg) {
    res.json({ result, arrImg });
  } else {
    res.json();
  }
  } catch (error) {
    res.json();
  }
})

//Update
router.put("/establishment", async (req, res) => {
  try {
    // let result = await Establishment.update(, {where :{EstId: req.body.EstId}});
    // result = await uploadImage(files, fields);
    // res.json({ result: constants.kResultOk,message: JSON.stringify(result)})
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

router.get("/establishment/staff/:EstId", async (req, res) => {
  try{
  const { EstId } = req.params;
  let owner = await Owner.findOne({ where: { EstId: EstId } });
  let user = await User.findOne({ where: {UserId: owner.UserId}})
  axios
    .post(`${apiBlockChain}/${server.VACCINATION}/${user.CitizenId}`)
    .then(async (response) => {
      let data = response.data.result;
      await Owner.update(
        { vaccineName1: data.vaccineName1, vaccineName2: data.vaccineName2 },
        { where: { UserId: owner.UserId } }
      );
    })
    .catch((err) => {
      console.error(err);
    });
  let staffUserUpdate = await findAllStaff(EstId);
  for (let i = 0; i < staffUserUpdate.length; i++) {
    const element = staffUserUpdate[i];
    axios
      .post(`${apiBlockChain}/${server.VACCINATION}/${element.CitizenId}`)
      .then(async (response) => {
        let data = response.data.result;
        await Staff.update(
          { vaccineName1: data.vaccineName1, vaccineName2: data.vaccineName2 },
          { where: { UserId: element.UserId } }
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }
  let ownerResult = await Owner.findOne({ where: { EstId: EstId } });
  let result = await User.findOne({ where: { UserId: ownerResult.UserId } });
  let staffUser = await findAllStaff(EstId);
  res.json({ ownerResult, result, staffUser });
}catch(error){
res.json({ result: constants.kResultNok, message: "Error" });
}
});

router.post("/establishment/staff", async (req, res) => {
  try{
  const data = req.body;
  let result = await User.findOne({ where: { CitizenId: data.CitizenId } });
  let EstId = data.EstId;
  if (result.Status === true) {
    axios
      .post(`${apiBlockChain}/${server.VACCINATION}/${data.CitizenId}`)
      .then(async (response) => {
        let dataVaccine = response.data.result;
        let StaffResult = await Staff.create({
          StaffId: result.UserId,
          UserId: result.UserId,
          EstId: EstId,
          vaccineName1: dataVaccine.vaccineName1,
          vaccineName2: dataVaccine.vaccineName2,
          Position: data.Position,
        });
        res.json({
          result: constants.kResultOk,
          message: JSON.stringify(StaffResult),
        });
      });
  } else {
    res.json({ result: constants.kResultNok, message: "novaccine" });
  }
}catch (error) {
  res.json({ result: constants.kResultNok, message: "Error" });
}
});

module.exports = router;
