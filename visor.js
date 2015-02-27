console.log('Visor started...');

var async = require('async');
var connect = require('connect');
var _ = require('lodash');
var fs = require('fs');
var events = require('events');

var httpevents = new events.EventEmitter();

httpevents.on('request', function(req, res){
	console.log('request');
});

var server = connect()
 .use(function(req, res, next) {
	httpevents.emit("request", req, res);
 });
 
server.listen(3000);

