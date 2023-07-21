/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Razia Sultana Makey Student ID: 176841211 Date: 2023-07-21
*
*  Online (Cyclic) Link: https://good-blue-fox-garb.cyclic.app/shop
*
********************************************************************************/ 



var express = require("express");
const multer = require("multer");
const cloudinary  = require("cloudinary").v2;
const streamifier  = require("streamifier");
const data = require("./store-service");
const path = require("path");
const exphbs = require('express-handlebars');
const { Console } = require("console");


var app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: {
    navLink : function(url, options){
      return (
        '<li class="nav-item"><a '+
        (url == app.locals.activeRoute? ' class="nav-link active" ': ' class="nav-link" ') +
        ' href="' + url + '">' +
        options.fn(this) +
         "</a></li>"
      );
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  },
  formatDate: function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
  }
  }
}));
app.set('view engine', '.hbs');

app.use(function(req,res,next){

    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
      
  next();
});

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
  res.redirect("/shop");
});

//set up route to my about page
app.get("/about", (req, res) => {
  res.render('about');
});


//set up route to shop page
app.get("/shop", async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await data.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await data.getPublishedItems();
    }
    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {

    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await data.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.message = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});


app.get('/shop/:id', async (req, res) => {


  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await data.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await data.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await data.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await data.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

//set up route to items page along with filters
app.get("/items", async (req, res) => {

  console.log("/items");

  const category = req.query.category;
  const minDateStr = req.query.minDate;

  let items = [];

  try{

    if(typeof category != 'undefined'){

      //filter items by category
      items = await data.getItemsByCategory(category);

    }else if(typeof minDateStr != 'undefined'){

      //filter items by date
      items = await data.getItemsByMinDate(minDateStr);
  
    }else{
      //show all items
      items = await data.getAllItems();
    }

   // console.log(items);

    if(items.length>0)
      res.render("items", { items: items });
    else
      res.render("items", { message: "no results" });

  }catch(err){
    console.log(err);
    res.render("items", { message: "no results" });
  }
});

//updated
//set up route to Add Item page
app.get("/items/add", async(req, res) => {
  console.log("/items/add");
  //res.render('addItem');
  try {
    const categories = await data.getCategories();   // Assuming getCategories() is the function to fetch categories
    console.log(categories);
    res.render("addItem", { categories: categories });
  } catch (error) {
    console.log(error);
    res.render("addItem", { categories: [] });
  }
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
    
    data.addItem(itemData).then((addedItem)=>{
      res.redirect("/items");
    });
  } 
});


//set up route to categories page
app.get("/categories", async (req, res) => {

  let viewData = {};

  try{
    const allCategories = await data.getCategories();
    viewData.categories = allCategories;
  }catch(err){
    console.log(err);
    viewData.message = err;
  }
  
  if (viewData.categories && viewData.categories.length > 0) {
    res.render("categories", { data: viewData });
  } else {
    res.render("categories", { message: "no results" });
  }
});

//updated
// Add the express.urlencoded() middleware
app.use(express.urlencoded({ extended: true }));

// Add the /categories/add route
app.get("/categories/add", (req, res) => {
  res.render("addCategory"); // Render the "addCategory" view
});

//Add the post route for /categories/add
app.post("/categories/add", (req, res) => {
  const categoryData = {
    // Set the category properties based on the req.body data
    category: req.body.category,
  };

 data.addCategory(categoryData)
    .then(() => {
      // Redirect to /categories upon successful addition of the category
      res.redirect("/categories");
    })
    .catch((error) => {
      // Handle the error case if addCategory() encountered an error
      res.render("addCategory", { message: error });
    });
});

//Add the route for /categories/delete/:id
app.get("/categories/delete/:id", (req, res) => {
  const categoryId = req.params.id;

  data.deleteCategoryById(categoryId)
    .then(() => {
      // Redirect to /categories upon successful deletion
      res.redirect("/categories");
    })
    .catch((error) => {
      // Return an error response if the deletion encountered an error
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

//Add the route for /Items/delete/:id
app.get("/Items/delete/:id", (req, res) => {
  const postId = req.params.id;

  data.deletePostById(postId)
    .then(() => {
      // Redirect to /Items upon successful deletion
      res.redirect("/Items");
    })
    .catch((error) => {
      // Return an error response if the deletion encountered an error
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});


//set up for no matching route
app.use((req, res) => {
  res.status(404).render("404");
  //res.status(404).send("Page Not Found" );
});

data.initialize()
.then(function(){
  app.listen(HTTP_PORT, onHTTPSTART);
})
.catch(function(err){
 console.log(err);
});

