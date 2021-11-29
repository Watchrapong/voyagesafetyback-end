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
const { findAllStaff, Staff, countStaff } = require("./models/staff");
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
  let result = await Establishment.findOne({ where: { EstId: EstId } });
  let arrImg = await image.findAll({ where: { EstId: EstId } });
  let percentageData = await countStaff(EstId);
  if (result && arrImg && percentageData) {
    res.json({ result, arrImg, percentageData });
  } else {
    res.json();
  }
});

//Add
router.post("/establishment", uploader.array("images", 3), async (req, res) => {
  try {
    let OwnerId = req.body.Owner;
    let myOwner = await Owner.findOne({ where: { OwnerId: OwnerId } });
    if (!myOwner) {
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
        Percent: 100,
      });
      axios
        .post(`${apiBlockChain}/${server.VACCINATION}/${req.body.CitizenId}`)
        .then(async (response) => {
          let vaccineName1 = response.data.result.vaccineName1;
          let vaccineName2 = response.data.result.vaccineName2;
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
        .catch(async (error) => {
          console.log(error);
          let userId = req.body.Owner;
          let ownerResult = await Owner.create({
            OwnerId: userId,
            UserId: userId,
            EstId: EstId,
            vaccineName1: "",
            vaccineName2: "",
          });
        });
      const mainImageElement = collection[0];
      const name = EstId;
      const fileName = `${EstId}_0`;
      const fileUpload = bucket.file(`${folder}/${fileName}.jpeg`);
      const resizeFileName = `${name}_0_700x350.jpeg`;
      const pathMainImg = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${folder}%2F${encodeURI(resizeFileName)}?alt=media`;
      var fields = {
        EstId: EstId,
        Img: pathMainImg,
        mainImage: true,
        fileName: fileName,
      };
      image.create(fields);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: mainImageElement.mimetype,
        },
      });
      blobStream.end(mainImageElement.buffer);
      for (let i = 1; i < collection.length; i++) {
        const element = collection[i];
        const name = EstId;
        const fileName = `${name}_${i}`;
        const fileUpload = bucket.file(`${folder}/${fileName}.jpeg`);
        const resizeFileName = `${name}_${i}_700x350.jpeg`;
        const pathImg = `https://firebasestorage.googleapis.com/v0/b/${
          bucket.name
        }/o/${folder}%2F${encodeURI(resizeFileName)}?alt=media`;
        var fields = {
          EstId: EstId,
          Img: pathImg,
          mainImage: false,
          fileName: fileName,
        };
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
    } else {
      res.json({
        result: constants.kResultNok,
        message: "aleady Establishment",
      });
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

//see my Establishment
router.get("/establishment/owner/:UserId", async (req, res) => {
  try {
    const UserId = req.params.UserId;
    let owner = await Owner.findOne({ where: { UserId } });
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
});

//Update
router.put("/establishment", async (req, res) => {
  try {
    let data = req.body;
    let result = await Establishment.update(
      {
        Name: data.Name,
        Description: data.Description,
        Address: data.address,
        District: data.district,
        Province: data.province,
        PostCode: data.postCode,
        Lat: data.lat,
        Lng: data.lng,
        SubCategoryId: data.type,
      },
      { where: { EstId: data.EstId } }
    );
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    console.log(error);
    res.json({ result: constants.kResultNok, message: JSON.stringify(error) });
  }
});

router.get("/establishment/staff/:EstId", async (req, res) => {
  try {
    const { EstId } = req.params;
    let owner = await Owner.findOne({ where: { EstId: EstId } });
    let user = await User.findOne({ where: { UserId: owner.UserId } });
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
            {
              vaccineName1: data.vaccineName1,
              vaccineName2: data.vaccineName2,
            },
            { where: { UserId: element.UserId } }
          );
          //update percent
          let result = await countStaff(EstId);
          let total = parseInt(result[0].Total) + 1;
          let no = parseInt(result[0].NotVaccinated);
          let yes = total - no;
          let Percent = (yes / total) * 100;
          await Establishment.update({ Percent }, { where: { EstId } });
          //
        })
        .catch((err) => {
          console.error(err);
          res.json({ result: constants.kResultNok, message: "Error" });
        });
    }
    let ownerResult = await Owner.findOne({ where: { EstId: EstId } });
    let result = await User.findOne({ where: { UserId: ownerResult.UserId } });
    let staffUser = await findAllStaff(EstId);
    res.json({ ownerResult, result, staffUser });
  } catch (error) {
    res.json({ result: constants.kResultNok, message: "Error" });
  }
});

router.post("/establishment/staff", async (req, res) => {
  try {
    const data = req.body;
    let result = await User.findOne({ where: { CitizenId: data.CitizenId } });
    let isOwner = await Owner.findOne({ where: { OwnerId: result.UserId } });
    let EstId = data.EstId;
    if (result && !isOwner) {
      axios
        .post(`${apiBlockChain}/${server.VACCINATION}/${data.CitizenId}`)
        .then(async (response) => {
          let dataVaccine = response.data.result;
          let StaffResult;
          if (dataVaccine.haveVaccine === true) {
            StaffResult = await Staff.create({
              StaffId: result.UserId,
              UserId: result.UserId,
              EstId: EstId,
              vaccineName1: dataVaccine.vaccineName1,
              vaccineName2: dataVaccine.vaccineName2,
              Position: data.Position,
            });
          } else {
            StaffResult = await Staff.create({
              StaffId: result.UserId,
              UserId: result.UserId,
              EstId: EstId,
              vaccineName1: "",
              vaccineName2: "",
              Position: data.Position,
            });
          }
          //update percent
          let count = await countStaff(EstId);
          let total = parseInt(count[0].Total) + 1;
          let no = parseInt(count[0].NotVaccinated);
          let yes = total - no;
          let Percent = (yes / total) * 100;
          await Establishment.update({ Percent }, { where: { EstId } });
          //
          res.json({
            result: constants.kResultOk,
            message: JSON.stringify(StaffResult),
          });
        })
        .catch((error) => {
          console.error(error)
          // res.json({
          //   result: constants.kResultNok,
          //   message: "staff aleady!",
          //   error,
          //   response
          // });
        });
    } else {
      res.json({
        result: constants.kResultNok,
        message: "no user found, is this owner",
      });
    }
  } catch (error) {
    res.json({ result: constants.kResultNok, message: error });
  }
});

router.delete("/establishment/staff/:UserId", async (req, res) => {
  try {
    let UserId = req.params.UserId;
    let userEst = await Staff.findOne({ where: { UserId }});
    let EstId = userEst.EstId;
    await Staff.destroy({ where: { UserId } });
    //update percent
    let result = await countStaff(EstId);
    let total = parseInt(result[0].Total) + 1;
    let no = parseInt(result[0].NotVaccinated);
    let yes = total - no;
    let Percent = (yes / total) * 100;
    await Establishment.update({ Percent }, { where: { EstId } });
    //
    console.log("run")
    res.json({ result: constants.kResultOk });
  } catch (error) {
    console.log(error)
    res.json({ result: constants.kResultNok, error: error});
  }
});

router.put(
  "/establishment/addmoreimage",
  uploader.single("image"),
  async (req, res) => {
    try {
      const data = req.file;
      const folder = "EstablishmentImage";
      const fileName = data.originalname;
      const contentType = req.file.mimetype;
      let newFileName;
      if (contentType == "image/jpg") {
        newFileName = fileName.replace(".jpg", ".jpeg");
      } else if (contentType == "image/png") {
        newFileName = fileName.replace(".png", ".jpeg");
      } else if (contentType == "image/gif") {
        newFileName = fileName.replace(".gif", ".jpeg");
      }
      let databaseFileName = newFileName.replace(".jpeg", "");
      const pathImg = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${folder}%2F${encodeURI(databaseFileName)}_700x350.jpeg?alt=media`;
      let result = await image.findAll({ where: { EstId: req.body.EstId } });
      if (result.length == 0) {
        await image.create({
          EstId: req.body.EstId,
          Img: pathImg,
          fileName: databaseFileName,
          mainImage: true,
        });
        await Establishment.update(
          { pathImg: pathImg },
          { where: { EstId: req.body.EstId } }
        );
      } else {
        await image.create({
          EstId: req.body.EstId,
          Img: pathImg,
          fileName: databaseFileName,
          mainImage: false,
        });
      }
      const fileUpload = bucket.file(`${folder}/${newFileName}`);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      blobStream.end(req.file.buffer);
      res.json({
        result: constants.kResultOk,
      });
    } catch (error) {
      res.json({
        result: constants.kResultNok,
        message: JSON.stringify(error),
      });
    }
  }
);

router.delete(
  "/establishment/deleteimage/:fileName/:EstId",
  async (req, res) => {
    const folder = "EstablishmentImage";
    const name = req.params.fileName;
    const EstId = req.params.EstId;
    let main = await image.findOne({ where: { fileName: name, EstId: EstId } });
    if (main.mainImage === true) {
      let result = await image.destroy({
        where: { fileName: name, EstId: EstId },
      });
      let replace = await image.findOne({ where: { EstId: EstId } });
      if (replace == null) {
        let newImage = await Establishment.update(
          { pathImg: "" },
          { where: { EstId: EstId } }
        );
        var file = `${folder}/${name}_700x350.jpeg`;
        await storage
          .bucket(bucket.name)
          .file(file)
          .delete()
          .then(() => {
            console.log("deleted successfully!");
            res.json({ result: constants.kResultOk });
          })
          .catch((error) => {
            console.log("unable to delete" + error);
            res.json({ result: constants.kResultNok });
          });
      } else {
        await image.update(
          { mainImage: true },
          { where: { ImgId: replace.ImgId } }
        );
        await Establishment.update(
          { pathImg: replace.Img },
          { where: { EstId: EstId } }
        );
        var file = `${folder}/${name}_700x350.jpeg`;
        await storage
          .bucket(bucket.name)
          .file(file)
          .delete()
          .then(() => {
            console.log("deleted successfully!");
            res.json({ result: constants.kResultOk });
          })
          .catch((error) => {
            console.log("unable to delete" + error);
            res.json({ result: constants.kResultNok });
          });
      }
    } else {
      let result = await image.destroy({ where: { fileName: name } });
      var file = `${folder}/${name}_700x350.jpeg`;
      await storage
        .bucket(bucket.name)
        .file(file)
        .delete()
        .then(() => {
          console.log("deleted successfully!");
          res.json({ result: constants.kResultOk });
        })
        .catch((error) => {
          console.log("unable to delete" + error);
          res.json({ result: constants.kResultNok });
        });
    }
  }
);

router.delete("/establishment/delete", async (req, res) => {});

module.exports = router;
