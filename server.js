const express = require("express")
const app = express()
const fs = require("fs").promises
const bcrypt = require("bcrypt")

app.use(express.json()) // use json type input 

const usernameValidator = function(req, res, next) { // username validator
    let username = req.body.username;
    const usernameRegex = /^[a-zA-Z0-9]{3,15}$/; // 3-15 characters long, having one small, one capital and one number.
    if(username.length == 0) {
        res.status(400).send("Username cannot be empty.")
    } else if(usernameRegex.test(username)) {
        next()
    } else {
        res.status(400).send("Username format is invalid")
    }
}

const passwordValidator = function(req, res, next) { // password validator
    let password = req.body.password;
    const passwordRegex = /^[a-zA-Z0-9!@#]{4,10}$/ // 4 to 10 characters long, one small, one capital, one number and few special characters.
    if (password.length == 0) {
        res.status(400).send("password cannot be empty")
    } else if (passwordRegex.test(password)) {
        next()
    } else {
        res.status(400).send("Password format is invalid")
    }
}

const emailValidator = function(req, res, next) { // email validator
    let email = req.body.email;
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/ // email validator from the internet
    if (email.length == 0) {
        res.status(400).send("email cannot be empty")
    } else if (emailRegex.test(email)) {
        next()
    } else {
        res.status(400).send("email format is not valid")
    }
}

app.get("/", async function (req, res) {
    let data = JSON.parse(await fs.readFile("./db.json", "utf-8"))
    let isPresent = await data['data'].find(element => element['email'] === req.body.email);
    let passwordCompare;
    let hasheddata = JSON.parse(await fs.readFile("./passwordhash.json", "utf-8"));
    bcrypt.compare(req.body.password, hasheddata[`${req.body.username}`], function(err, result){
        console.log(hasheddata[`${req.body.username}`])
        if(err) {
            console.log(err)
        } else {
            if(result && isPresent) {
                res.status(200).send(JSON.stringify(isPresent))
            } else {
                res.status(400).send("User not found. Sorry!")
            }   
        }
    })
    })

app.post("/data", usernameValidator, passwordValidator, emailValidator, async function(req, res) {
    let data = JSON.parse(await fs.readFile("./db.json", "utf-8"))
    let isPresent = await data['data'].find(element => element['email'] === req.body.email);
    console.log(isPresent)
    if(isPresent){
        res.status(400).send("User already exists")
    } else {
        let data = JSON.parse(await fs.readFile("./db.json", "utf-8"))
        bcrypt.hash(req.body.password, 10, function(err, hash){
            if(err) {
                console.log(error)
            } else {
                console.log(hash)
                let  obj = {};
                obj[`${req.body.username}`] = hash;
                fs.writeFile("./passwordhash.json", JSON.stringify(obj), function(error) {
                    if(error) {
                        console.log(error)
                    } else {
                        console.log("hashed password stored successfully")
                    }
                })
            }
        })
        data['data'].push(req.body)
        await fs.writeFile("./db.json", JSON.stringify(data));
        res.status(400).send("data saved successfully")
    }    
})


port = 3000
app.listen(port, function () {
    console.log("server is running")
})