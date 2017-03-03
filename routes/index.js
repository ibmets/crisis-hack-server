'use strict';

var express = require('express');
var router = express.Router();
var Promise = require('promise');
// https://www.npmjs.com/package/request
var needle = require('needle');
//var bodyParser = require('body-parser');

var twilioFunctions = require('./twilio.js');

// HTTP GET - Return all tweets
router.get('/', function(req, res, next) {
  res.json({"hello":"world"});
});

router.get('/sendMessage', function(req, res, next) {

    if(req.query.body){

        var to = req.query.to;
        var from = "+441403540126";
        var body = req.query.body;
        twilioFunctions.sendMessage(to, from, body,
            function(result) {
            res.json(result);
        });
    } else
        {res.status(500).send();}

});

router.post('/receiveMessage', function(req, res, next) {
    var timestamp = + new Date();

    var url = "http://ce-crisishack.eu-gb.mybluemix.net/ce-store/sentences";

    var sentence = "there is an sms message named 'sms_{uid}' that is from the number '" + req.body.From + "' and is to the number '" + req.body.To + "' and has '" + timestamp + "' as timestamp and has '" + req.body.Body + "' as message text.";
    console.log(sentence);
    twilioFunctions.insertSentence(sentence, url).then(function (response) {
                var jsonResponse = JSON.parse(response);
                if (jsonResponse.alerts.errors.length == 0) {
                    console.log(" INSETRED:  "+ sentence );
                } else {
                    console.log(" ERROR:  "+ jsonResponse);
                }
            });

   // res.send();
});

module.exports = router;
