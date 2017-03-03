'use strict';
var express = require('express');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');
var cors = require('cors');

// load environment properties from a .env file for local development
require('dotenv').config()

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(){ 
	console.log('client connected');
});
app.set('socketio', io);

app.use(cors());
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var routes = require('./routes/index');
var geo = require('./routes/geo');

app.use('/', routes);
app.use('/geo', geo);

var appEnv = cfenv.getAppEnv();
server.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});
