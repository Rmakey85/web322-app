const fs = require("fs");
let items = [];
let categories = [];

module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        fs.readFile('./data/items.json',(err,data)=>{
            if(err){
                console.log(err);
                reject("unable to read file items.json");
            }else{
                items = JSON.parse(data);

                fs.readFile('./data/categories.json',(err,data)=>{
                    if(err){
                        console.log(err);
                        reject("unable to read file categories.json");
                    }else{
                        categories = JSON.parse(data);
                        resolve(true);
                    }
                });

            }
        })
    })
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        if(items.length==0){
            reject("no results returned");
        }else{
            resolve(items);
        }
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        if(items.length==0){
            reject("no results returned");
        }else{
            let publishedItems = [];
            items.forEach(value=>{
                if(value.published==true){
                    publishedItems.push(value);
                }
            });
            
            if(publishedItems.length==0){
                reject("no results returned");
            }else{
                resolve(publishedItems);
            }
            
        }
    })
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        if(categories.length == 0){
            reject("no results returned")
        }else{
            resolve(categories);
        }
    });
}
