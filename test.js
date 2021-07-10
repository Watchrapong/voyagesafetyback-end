const bcrypt = require("bcryptjs");

const pass = bcrypt.hashSync('1111',8)
console.log(pass)