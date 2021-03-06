const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const config = require("./config/config");

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(multer({ dest: "uploads/" }).single("file"));

app.use(express.static(__dirname + "/static"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

require("./api/routes/dashboard")(app);

app.listen(config.app.port, "0.0.0.0", () => {
  console.log("App is running!");
});
