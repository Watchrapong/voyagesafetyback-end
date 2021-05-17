const Establishment = require("./models/establishment")
const user = require("./models/user");


let result =  user.findAll();
console.log(result)