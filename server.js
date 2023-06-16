/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Razia Sultana Makey Student ID: 176841211 Date: 2023-06-16
*
*  Online (Cyclic) Link: https://good-blue-fox-garb.cyclic.app/about
*
********************************************************************************/ 



var express = require("express");
const multer = require("multer");
const cloudinary  = require("cloudinary").v2;
const streamifier  = require("streamifier");
const data = require("./store-service");
const path = require("path");

var app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({ 
  cloud_name: 'ddytkxlg6', 
  api_key: '215327768878866', 
  api_secret: 'b2dY0kESzf7JffsH_r4ZQ00JTKA' 
});
const upload = multer(); 

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

//set up route to items page along with filters
app.get("/items", (req, res) => {

  //console.log(req.query);

  const category = req.query.category;
  const minDateStr = req.query.minDate;

  if(typeof category != 'undefined'){
    //filter items by category
    data.getItemsByCategory(category).then(function(items){
      res.json(items);
    }).catch(function(err){
      res.json({"message": err});
    });

  }else if(typeof minDateStr != 'undefined'){
    //filter items by date
    data.getItemsByMinDate(minDateStr).then(function(items){
      res.json(items);
    }).catch(function(err){
      res.json({"message": err});
    });

  }else{
    //show all
    data.getAllItems().then(function(items){
      res.json(items);
    }).catch(function(err){
      res.json({"message": err});
    });
  }


});

//set up route to Add Item page
app.get("/items/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addItem.html"));
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {

    if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );

              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };

      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }

      upload(req).then((uploaded)=>{
          processItem( uploaded.url);
      });
  }else{
    
      processItem("");
  }

  function processItem(imageUrl){

    if(typeof imageUrl !== 'undefined'){
      req.body.featureImage = imageUrl; 
    }

    // Create a new Date object for the current date
    const currentDate = new Date();

    // Extract the year, month, and day from the Date object
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Create the formatted date string
    const postDate = `${year}-${month}-${day}`;
    const itemData = {
      "category":req.body.category,
      "postDate":postDate,
      "featureImage":req.body.featureImage,
      "price":req.body.price,
      "title":req.body.title,
      "body":req.body.body,
      "published":req.body.published
    };
    console.log(itemData);
    data.addItem(itemData).then((addedItem)=>{
      res.redirect("/items");
    });
  } 
});


// return specific item
app.get('/item/:itemId', (req, res) => {
  //console.log(req.params);
  data.getItemById(req.params.itemId).then(function(item){
    res.json(item);
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

