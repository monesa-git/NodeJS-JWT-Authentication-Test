const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;
const bodyParser = require('body-parser');

const path = require('path');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

var decoded={};
var tokenCheck;

const secretKey = "My super secret key";

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow_Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Origin', 'Content-type,Authorization');
    next();
});


var verifyToken = function(req,res,next){
    var tokenValue = req.header('authorization').split(" ")[1];
    // console.log(tokenValue);
    if(!tokenValue){
        res.json({
            success: false,
            myContent: "Invalid Token. Please login again!"
        });
    }

    var authData = req.header('authorization').split(" ")[1];
    if(authData){
        tokenCheck = authData;
        try {
            decoded = jwt.verify(tokenCheck, secretKey);
            if(!decoded){
                res.json({
                    success: false,
                    myContent: "Invalid Token. Please login again!"
                });
            }
            if(!decoded.username){
                res.json({
                    success: false,
                    myContent: "Unauthorized User. Please check your credentials!"
                });
            }
            next();
          } catch(err) {
            // return res.status(400).send('<script>alert("'+err.toString()+'");</script>');
            res.json({
                success: false,
                myContent: err.toString()+" Please login again"
            });
          }
        }else{
            res.json({
                success: false,
                myContent: "Please login again"
            });
        }

};

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


app.use(bodyParser.json());

let users = [
    {
        id: 1,
        username: 'monesa',
        password: '123'
    },
    {
        id: 2,
        username: 'krishna',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let inside = false;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            inside = true;
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        } 
        
    }

    if(!inside){
        res.status(401).json({
            success: false,
            token: null,
            err: 'username or password is incorrect'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});

app.use(function (err, req, res, next) {
    console.log("hello app.use");
    if (err.name === 'UnauthorizedError') {
        console.log("It is coming inside unauthorized error");
        res.status(401).json({
            success: false,
            officialError: err,
            err: "Username or password is incorrect"
        });
    } else {
        next(err);
    }
});

app.get('/api/dashboard', verifyToken, (req, res) => {
    console.log("coming to dashboard");
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});


app.get('/api/settings', verifyToken, (req, res) => {
    // console.log(req);
    res.json({
        success: true,
        myContent: 'Settings Page is now protected'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    // console.log(req);
    res.json({
        success: true,
        myContent: 'This is the price $3.99'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

