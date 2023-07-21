const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

var sequelize = new Sequelize('jjflottg', 'jjflottg', 'Pj_a832-TgIDblkweZiw3-kQZggI2qsf', {
    host: 'stampy.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

var Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

Item.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        sequelize.sync().then(function(){
        resolve(true);
       }).catch(function(err){
        reject("unable to sync the database");
       });  
    })
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll().then(function(data){
            //console.log(data.length);
            resolve(data);
        }).catch(err=>{
            console.log(err);
            reject("no results returned");
        })
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                published: true
            }
        }).then(function(publishedItems){
            resolve(publishedItems);
        }).catch(err=>{
            reject("no results returned");
        });
    })
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        Category.findAll().then(function(data){
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        })
    });
}

module.exports.getItemsByCategory = function(categoryToFind){
    return new Promise((resolve,reject)=>{

        Item.findAll({
            where: {
                category: categoryToFind
            }
        }).then(function(response){
            resolve(response);
        }).catch(err=>{
            reject("no results returned");
        });

    });
}

module.exports.getPublishedItemsByCategory = function(categoryId){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                category: categoryId,
                published: true
            }
        }).then(function(itemsFound){
            resolve(itemsFound);
        }).catch(err=>{
            reject("no results returned");
        });
    });
}

module.exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }       
            }
        }).then(function(response){
            resolve(response);
        }).catch(err=>{
            reject("no results returned");
        });

    });
}

module.exports.getItemById = function(itemId){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                id: itemId
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch(err=>{
            reject("no results returned");
        });
    })
}

module.exports.addItem = function(itemData){
    return new Promise((resolve,reject)=>{
        itemData.published = (itemData.published) ? true : false;
        //Replace empty values with null
        for (let prop in itemData) {
            if (itemData[prop] === "") {
              itemData[prop] = null;
            }
        }

        itemData.postDate = new Date();

        console.log(itemData);
        Item.create(itemData).then(function(response){
            resolve(response);
        }).catch(err=>{
            console.log(err);
            reject("Unable to create Item");
        });
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve,reject)=>{
        //Replace empty values with null
        for (let prop in categoryData) {
            if (categoryData[prop] === "") {
              categoryData[prop] = null;
            }
          }
        Category.create(categoryData).then(function(response){
            resolve(response);   //Resolve the promise if Category.create() succeeds
        }).catch(err=>{
            reject("unable to create category");
        });
    })
}


module.exports.deleteCategoryById = function(id){
    return new Promise((resolve,reject)=>{
        Category.destroy({
            where: {
                id: id
            }
        }).then((deletedRows) => {
            if (deletedRows > 0) {
              resolve(); // Resolve the promise if category was deleted
            } else {
              reject("Category not found"); // Reject the promise if category was not found
            }
        }).catch((error) => {
            reject(error); // Reject the promise if an error occurred during deletion
        });
    })
}

module.exports.deletePostById = function(id){
    return new Promise((resolve,reject)=>{
        Item.destroy({
            where: {
                id: id
            }
        }).then((deletedRows) => {
            if (deletedRows > 0) {
              resolve(); // Resolve the promise if item was deleted
            } else {
              reject("Item not found"); // Reject the promise if item was not found
            }
        }).catch((error) => {
            reject(error); // Reject the promise if an error occurred during deletion
        });
    })
}