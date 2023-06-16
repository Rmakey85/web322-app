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

module.exports.addItem = function(itemData){
    return new Promise((resolve,reject)=>{
        if(typeof itemData.published === 'undefined'){
            itemData.published = false;
        }else{
            itemData.published = true; 
        }
        itemData["id"] = items.length+1;
        items.push(itemData);
        resolve(itemData);
    });
}

module.exports.getItemsByCategory = function(categoryId){
    return new Promise((resolve,reject)=>{

        const filteredItemsByCategory = items.filter(currentItem => currentItem.category == categoryId);

        if(filteredItemsByCategory.length==0){
            reject("no results returned");
        }else{
            resolve(filteredItemsByCategory);
        }
    });
}

module.exports.getItemsByMinDate = function(minDateStr){
    return new Promise((resolve,reject)=>{

        const filteredItemsByMinDate = [];

        for(let i=0; i<items.length; i++){
            if(new Date(items[i].postDate) >= new Date(minDateStr)){
                filteredItemsByMinDate.push(items[i]);
            }            
        }

        if(filteredItemsByMinDate.length==0){
            reject("no results returned");
        }else{
            resolve(filteredItemsByMinDate);
        }
    });
}

module.exports.getItemById = function(itemId){
    return new Promise((resolve,reject)=>{

        const foundItem = items.find(currentItem => currentItem.id == itemId);
//console.log({itemId, foundItem});

        if(typeof foundItem === 'undefined'){
            reject("no result returned");
        }else{
            resolve(foundItem);
        }
            

    })
}
