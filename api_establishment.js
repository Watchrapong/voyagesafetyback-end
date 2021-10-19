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
  if (result) {
    res.json(result);
  } else {
    res.json();
  }
});

//Add
router.post("/establishment", uploader.array("images", 3), async (req, res) => {
  try {
    const collection = req.files;
    let EstId = 100;
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
      Owner: req.body.Owner,
      Lat: req.body.Lat,
      Lng: req.body.Lng,
      SubCategoryId: req.body.SubCategoryId,
      pathImg: pathImg,
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

//Update
router.put("/establishment", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      // let result = await Establishment.update(fields, {where :{EstId: fields.EstId}});
      // result = await uploadImage(files, fields);

      // res.json({ result: constants.kResultOk,message: JSON.stringify(result)})
      console.log(fields.image[0]);
    });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

module.exports = router;
