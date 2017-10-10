const express = require('express'),
      jwt     = require('jsonwebtoken'),
      models  = require('../models'),
      config  = require('../config');

const router = express.Router();

function createIDToken(user) {
  return jwt.sign(_.omit(user, 'password'),
          config.secret,
          { expiresIn: 60*60 });
}

function createAccessToken(user) {
  return jwt.sign({
    algorithm: 'HS256',
    exp: Math.floor(Date.now() / 1000) + (60*60),
    aud: config.audience,
    iss: config.issuer,
    jwtid: genJwtid(),
    sub: user.id,
    scope: 'read:user',
  }, config.secret);
}

function genJwtid() {
  let jwtid = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for(let i = 0; i < 16; i++) {
    jwtid += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return jwtid;
}

//Register New User
//Check if user exists.
//If not, create new user.
//Persist session to local storage.
//Respond with error or ok.
router.post('/register', function(req, res){

  if(!req.body.username || !req.body.password) {
    return res.status(400).send("Please enter your username and password.");
  }

  models.User.findOne({
     where: {
       username: req.body.username,
     }
  }).then((target) => {
    if(target) {
      return res.status(400).send("Username taken.");
    }
    else {
      models.User.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
      }).then((user) => {
        res.status(201).send({
          id_token: createIDToken(user.dataValues),
          access_token: createAccessToken(user.dataValues)
        })
      }).catch((error) => {
        return res.status(401).send(error);
      })
    }
  })
})

//Login
//Find user.
//Verify credentials.
//Persist to local storage.
//Respond with error or ok.
router.post('/auth', function(req, res){
  if(!req.body.username || !req.body.password) {
    return res.status(400).send("Please enter your username and password.");
  }
  models.User.findOne({
     where: {
       username: req.body.username,
       password: req.body.password,
     }
  }).then((user) => {
    if(user) {
      //persist login and redirect
      res.status(201).send({
        id_token: createIDToken(user.dataValues),
        access_token: createAccessToken(user.dataValues)
      })
    }
    else {
      //res with error
      return res.status(401).send("Username or Password don't match our records.");
    }
  })
})

module.exports = router;
