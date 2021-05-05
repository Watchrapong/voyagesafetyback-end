const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use("/api/v2/authen/", require("./api_authen"));
app.use("/api/v2/", require("./api_establishment"));

app.listen(8085, ()=>{
    console.log("Backend is running..")
})