const express = require("express");
const router = express.Router();
const user = require("./models/user");
const constants = require("./constant");

router.post("/login", (req, res)=>{
    res.json({result: "login"})
})

router.post('/register', async (request, response) =>{
console.log(request.body)
    try {
        String.prototype.hashCode = function() {
            var hash = 0;
            if (this.length == 0) {
                return hash;
            }
            for (var i = 0; i < this.length; i++) {
                var char = this.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        }
        request.body.UserId = Math.abs(request.body.FirstName.hashCode()+request.body.LastName.hashCode());
        request.body.Status="true";//check on blockchain
        let result = await user.create(request.body);
        response.json({ result: constants.kResultOk, message: JSON.stringify(result) });
      } catch (error) {
        response.json({ result: constants.kResultNok, message: JSON.stringify(error) });
      }
    
  });

module.exports = router;