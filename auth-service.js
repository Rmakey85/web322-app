const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName":  String,
    "password": String,
    "email": String,
    "loginHistory":
        [{"dateTime": Date,
        "userAgent": String}]
  });
  
  let User; // to be defined on new connection (see initialize)

  module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbUser:MongodbUser23@senecaweb.nsqxvdw.mongodb.net/");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};


module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if(userData.password != userData.password2){
            reject("The two password do not match");
        }else{
            // Hash the password using bcrypt with 10 rounds of salt
            bcrypt.hash(userData.password, 10)
                    .then((hash) => {
                    // Replace the user entered password with its hashed version
                    userData.password = hash;
                    let newUser = new User(userData);

                    newUser.save().then(savedUser =>{
                        console.log(savedUser);
                        resolve(savedUser);
                    }).catch(err =>{
                        console.log(err);
                        if(err.code == 11000){
                            reject("User Name already taken")
                        }else{
                            reject("There was an error creating the user: " + err);
                        }
                    });
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
        }
    });
};
  
module.exports.checkUser = (userData) =>{
    return new Promise((resolve, reject) =>{
        User.find({userName: userData.userName})
        .exec()
        .then((users) =>{
            if(users.length == 0){
                reject("Unable to find user: " + userData.userName);
            }else{
                //console.log(userData, User[0].password);
                bcrypt.compare(userData.password, users[0].password).then((res)=>{
                    if(res === true){
                        let newDate = new Date();
                        users[0].loginHistory.push(
                            {
                                dateTime: newDate.toString(), 
                                userAgent: userData.userAgent
                            }
                        );
                        User.updateOne({userName: users[0].userName}, {$set:{loginHistory: users[0].loginHistory}})
                        .exec()
                        .then(()=>{
                            resolve(users[0]);
                        }).catch((err)=>{
                            console.log(err);
                            reject("There was an error verifying the user: "  + err);
                        });
                    }else{
                        console.log("Incorrect Password for user: "+ userData.userName);
                        reject("Incorrect Password for user: "+ userData.userName);
                    }
                });
            }
        }).catch((err)=>{
            console.log(err);
            reject("Unable to find user: " + userData.userName);
        })
    });
};
