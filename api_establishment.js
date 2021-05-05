const express = require("express");
const router = express.Router();

router.get("/establishment", (req, res)=>{
    res.json({result: "establishment"})
})

module.exports = router;