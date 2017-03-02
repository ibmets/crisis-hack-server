'use strict';

var express = require('express');
var router = express.Router();


// HTTP GET - Return all tweets
router.get('/', function(req, res, next) {
  res.json({"hello":"world"});
});


module.exports = router;