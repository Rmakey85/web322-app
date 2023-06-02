var express = require("express");
const data = require("./store-service");
const path = require("path");

var app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

//welcome message
function onHTTPSTART() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

//set up route to my default page
app.get("/", (req, res) => {
  res.redirect("/about");
});

//set up route to my about page
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.listen(HTTP_PORT, onHTTPSTART);
