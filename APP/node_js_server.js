var express = require('express');
var app = express();
// for parsing the body in POST request
var bodyParser = require('body-parser');
const { spawnSync } = require("child_process");
const config = require('../config/default.json');

// Pseudo Database, should be replace
const fs = require('fs');
const file = '../config/local_database.json';
const db = require(file);

var logger = require("../logs/logger").Logger;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET /api/users
app.get('/blind', function(req, res){

	console.log("GET request incoming");
	logger.info("GET request incoming");
	res_str = "ERROR";
	
	db.rooms.forEach(function(room){
		room.blinds.forEach(function(blind) {
			if(blind == req.body.id){
			
				const cmd = spawnSync(config.server.PATH_knx, ['raw', '4/4/' + req.body.id , '0', '1', '0']);
				
				if(cmd.stdout.toString()){
					res_str = cmd.stdout.toString();
					logger.info(`KNX server response: ${cmd.stdout.toString()}`);
					console.log(`KNX server response: ${cmd.stdout.toString()}`);
				}
				if(cmd.stderr.toString()){
					logger.error(`KNX server response: ${cmd.stderr.toString()}`);
					console.log(`KNX server response: ${cmd.stderr.toString()}`);
				}

			}
		});
	});

	return res.json(res_str);    
});

app.get('/radiator', function(req, res){

	console.log("GET request incoming");
	logger.info("GET request incoming");
	
	res_str = "ERROR";
	
	db.rooms.forEach(function(room){
		room.radiators.forEach(function(radiator) {
			if(radiator == req.body.id){
			
				const cmd = spawnSync(config.server.PATH_knx, ['raw', '0/4/' + req.body.id , '0', '1', '0']);
				
				if(cmd.stdout.toString()){
					res_str = cmd.stdout.toString();
					logger.info(`KNX server response: ${cmd.stdout.toString()}`);
					console.log(`KNX server response: ${cmd.stdout.toString()}`);
				}
				if(cmd.stderr.toString()){
					logger.error(`KNX server response: ${cmd.stderr.toString()}`);
					console.log(`KNX server response: ${cmd.stderr.toString()}`);
				}

			}
		});
	});

	return res.json(res_str);     
});

function percent_knx (percent,base) {
     return parseInt(percent / 100. * base);
}

app.post('/beacon', function (req, res) {

	console.log(req.body.room + " " + req.body.isInside + " " + req.body.time);
	logger.info("POST request incoming");

	return res.send('Ok');
    
});

app.post('/blind', function (req, res) {

	console.log("POST request incoming");
	logger.info("POST request incoming");

	percent = percent_knx(req.body.percent, 255);
		
	db.rooms.forEach(function(room) {
		if(room.id == req.body.room){
			
			console.log("Room selected:" + room.id);
			logger.info("Room selected:" + room.id);
			
			room.blinds.forEach(function(blind) {
				const cmd = spawnSync(config.server.PATH_knx, ['raw', '3/4/' + blind , percent, '2', '2']);
				
				if(cmd.stdout.toString()){
					logger.info(`KNX server response: ${cmd.stdout.toString()}`);
					console.log(`KNX server response: ${cmd.stdout.toString()}`);
				}
				if(cmd.stderr.toString()){
					logger.error(`KNX server response: ${cmd.stderr.toString()}`);
					console.log(`KNX server response: ${cmd.stderr.toString()}`);
				}
			});
		}
	});

	
	return res.send('Ok');
    
});

app.post('/radiator', function (req, res) {

	console.log("POST request incoming");
	logger.info("POST request incoming");

	percent = percent_knx(req.body.percent, 255);
		
	db.rooms.forEach(function(room) {
		if(room.id == req.body.room){
			
			console.log("Room selected:" + room.id);
			logger.info("Room selected:" + room.id);
			
			room.radiators.forEach(function(radiator) {
				const cmd = spawnSync(config.server.PATH_knx, ['raw', '0/4/' + radiator , percent, '2', '2']);
				
				if(cmd.stdout.toString()){
					logger.info(`KNX server response: ${cmd.stdout.toString()}`);
					console.log(`KNX server response: ${cmd.stdout.toString()}`);
				}
				if(cmd.stderr.toString()){
					logger.error(`KNX server response: ${cmd.stderr.toString()}`);
					console.log(`KNX server response: ${cmd.stderr.toString()}`);
				}
			});
		}
	});

	return res.send('Ok');
    
});

app.post('/command', function (req, res) {

	console.log("POST request /command incoming");
	logger.info("POST request /command incoming");
	
	console.log("Commands: " + req.body.command_1 + req.body.command_2 + req.body.command_3 + req.body.command_4 );
	logger.info("Commands: " + req.body.command_1 + req.body.command_2 + req.body.command_3 + req.body.command_4 );

	let content = JSON.parse(fs.readFileSync(file, 'utf8'));
	content.commands[0] = req.body.command_1;
	content.commands[1] = req.body.command_2;
	content.commands[2] = req.body.command_3;
	content.commands[3] = req.body.command_4;
	fs.writeFileSync(file, JSON.stringify(content));

	return res.send('Ok');
    
});

app.listen(config.server.port, function(){
	logger.info('Server listening on port 3000');
	console.log('Server listening on port 3000');
});


////////////////////////////////////////////////////////////////////
// /!\ THIS ROUTIN IS EXECUTED ON THE LOCALHOST
// A BETTER PRACTICE WOULD BE TO PUT IT ON THE CLOUD
////////////////////////////////////////////////////////////////////


function intervalFunc() {
 console.log("Automatic commands executed");
 logger.info("Automatic commands executed");
 
 let content = JSON.parse(fs.readFileSync(file, 'utf8'));
 if(content.commands[0] == 1){
 	content.rooms.forEach(function(room) {
 	room.radiators.forEach(function(radiator) {
		if(room.is_occupied == 0){
			
			const cmd = spawnSync(config.server.PATH_knx, ['raw', '0/4/' + radiator , percent_knx(25, 255), '2', '2']);
				
			if(cmd.stdout.toString()){
				logger.info(`KNX server response: ${cmd.stdout.toString()}`);
				console.log(`KNX server response: ${cmd.stdout.toString()}`);
			}
			if(cmd.stderr.toString()){
				logger.error(`KNX server response: ${cmd.stderr.toString()}`);
				console.log(`KNX server response: ${cmd.stderr.toString()}`);
			}
			
		}
	});
	});
 }
 
 if(content.commands[1]  == 1){
	content.rooms.forEach(function(room) {
	room.radiators.forEach(function(radiator) {
		if(room.is_occupied){
			
			const cmd = spawnSync(config.server.PATH_knx, ['raw', '0/4/' + radiator , percent_knx(75, 255), '2', '2']);
				
			if(cmd.stdout.toString()){
				logger.info(`KNX server response: ${cmd.stdout.toString()}`);
				console.log(`KNX server response: ${cmd.stdout.toString()}`);
			}
			if(cmd.stderr.toString()){
				logger.error(`KNX server response: ${cmd.stderr.toString()}`);
				console.log(`KNX server response: ${cmd.stderr.toString()}`);
			}
			
		}
	});
	});
 
 }
 
 if(content.commands[2]  == 1){
	content.rooms.forEach(function(room) {
 	room.blinds.forEach(function(blind) {
		if(room.humidity > 25){

			const cmd = spawnSync(config.server.PATH_knx, ['raw', '3/4/' + blind , percent_knx(0, 255), '2', '2']);
			
			if(cmd.stdout.toString()){
				logger.info(`KNX server response: ${cmd.stdout.toString()}`);
				console.log(`KNX server response: ${cmd.stdout.toString()}`);
			}
			if(cmd.stderr.toString()){
				logger.error(`KNX server response: ${cmd.stderr.toString()}`);
				console.log(`KNX server response: ${cmd.stderr.toString()}`);
			}
		}
	});
	});
 
 }
 
 if(content.commands[3]  == 1){
 	content.rooms.forEach(function(room) {
 	room.blinds.forEach(function(blind) {
		if(room.luminance < 25 && room.is_occupied  == 1){

			const cmd = spawnSync(config.server.PATH_knx, ['raw', '3/4/' + blind , percent_knx(99, 255), '2', '2']);
			
			if(cmd.stdout.toString()){
				logger.info(`KNX server response: ${cmd.stdout.toString()}`);
				console.log(`KNX server response: ${cmd.stdout.toString()}`);
			}
			if(cmd.stderr.toString()){
				logger.error(`KNX server response: ${cmd.stderr.toString()}`);
				console.log(`KNX server response: ${cmd.stderr.toString()}`);
			}
		}
	});
	});
 
 }
 
 
 
 // if (count == '5') {
 //   clearInterval(this);
 // }
}
setInterval(intervalFunc, 60000);

