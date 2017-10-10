const express = require('express'),
      jwt     = require('express-jwt'),
      models  = require('../models'),
      config  = require('../config');

const router = express.Router();

// Validate access_token
var jwtCheck = jwt({
  secret: config.secret,
  aud: config.audience,
  iss: config.issuer
})

// Check for scope
function requireScope(scope) {
  return function (req, res, next) {
    var has_scopes = false;

    var user_scopes = req.user.scope.split(" ");
    for(let i = 0; i < user_scopes.length; ++i) {
      if(user_scopes[i] === scope) { has_scopes = true; }
    }

    if (!has_scopes) {
      res.sendStatus(401);
      return;
    }
    next();
  };
}

// Basic user route responds with all user data in json
// Scope: read:user
// Get All Users
// Find all users.
// Respond w/ all users.
router.use('/users', jwtCheck, requireScope('read:user'));
router.get('/users', function(req, res, next){
  models.User.findAll().then(users => {
    res.json(users);
  }).catch((err) => {
    console.log(err);
  })
})

// Scope: read:user
//Get Individual User
//Find user.
//Respond w/ user.
router.use('/user', jwtCheck, requireScope('read:user'));
router.get('/user', function(req, res, next){
  models.User.findOne({
    where: {
      id: req.user.sub
    }
  }).then((user) => {
    res.json(user);
  })
})


module.exports = router;
