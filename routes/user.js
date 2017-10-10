const express = require('express'),
      models  = require('../models');

const router = express.Router();

//Basic user route responds with all user data in json
router.get('/users', function(req, res, next){
  models.User.findAll().then((users) => {
    res.json(users);
  }).catch((err) => {
    console.log(err);
  })
})
