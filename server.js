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


//set up route to shop page
app.get("/shop", (req, res) => {
  res.send("TODO: get all items who have published==true");
});

//set up route to items page
app.get("/items", (req, res) => {
  res.send("TODO: get all items");
});

//set up route to categories page
app.get("/categories", (req, res) => {
  res.send("TODO: get all categories");
});

//set up for no matching route
app.use((req, res) => {
  res.status(404).send("Page Not Found" );
});

app.listen(HTTP_PORT, onHTTPSTART);

