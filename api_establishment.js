const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
const Establishment = require("./models/establishment");
const op = Sequelize.Op;
const constants = require("./constant");
const formidable = require("formidable");

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
  if(result){
  res.json(result);
  }else{
    res.json();
  }

});

//Add
router.post("/establishment", async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      let result = await Establishment.create(fields);
      res.json({
        result: constants.kResultOk,
        message: JSON.stringify(result),
      });
    });
  } catch (error) {
    res.json({result: constants.kResultNok,message: JSON.stringify(error)})
  }
});

//Update
router.put("/establishment", async (req, res) => {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      let result = await Establishment.update(fields, {where :{EstId: fields.EstId}});
      result = await uploadImage(files, fields);

      res.json({ result: constants.kResultOk,message: JSON.stringify(result)})
    })
  } catch (error) {
    res.json({ result: constants.kResultNok, message: JSON.stringify(error)})
  }
})



module.exports = router;
