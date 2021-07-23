const jwt = require('jsonwebtoken');
const constants = require('../constant');

module.exports = (req,res,next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        //const token = req.body.userData;
        const decoded = jwt.verify(token,'voyage');
        req.userData = decoded;
        next();

    }catch(error){
        return res.json({ result: constants.kResultNok, message: "Unauthorized" })
    }
}
