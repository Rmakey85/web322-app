/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Razia Sultana Makey Student ID: 176841211 Date: 2023-06-02
*
*  Online (Cyclic) Link: https://good-blue-fox-garb.cyclic.app/about
*
********************************************************************************/ 



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
  data.getPublishedItems().then(function(publishedItems){
    res.json(publishedItems);
  }).catch(function(err){
    res.json({"message": err})
  });
});

//set up route to items page
app.get("/items", (req, res) => {
  data.getAllItems().then(function(items){
    res.json(items);
  }).catch(function(err){
    res.json({"message": err});
  });
});

//set up route to categories page
app.get("/categories", (req, res) => {
  data.getCategories().then(function(categories){
    res.json(categories);
  }).catch(function(err){
    res.json({"message": err});
  });
});

//set up for no matching route
app.use((req, res) => {
  res.status(404).send("Page Not Found" );
});

data.initialize()
.then(function(){
  app.listen(HTTP_PORT, onHTTPSTART);
})
.catch(function(err){
 console.log(err);
});



