var express = require('express');
var app = express();
// for parsing the body in POST request
var bodyParser = require('body-parser');
const config = require('../config/default.json');

const fs = require('fs');
const file = '../config/local_database.json';
const db = require(file);

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

/////////////////////////////////////////////////////////////////////////////////////
// TO USE ANOTHER CLOUD PLATEFORM JUST CHANGE THE CODE NOT IN PRACKET WITH THE GOOD API
// Get the rooms in the config and assign 2 field used in this program
/////////////////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




var ONE_MINUTE = 60 * 1000;
db.rooms.forEach(function(room){
	room.is_occupied = 0;
	room.last_time_since_occupied = new Date();
});

//////////////////////////////////////////////////////////////////////////////////////


var deviceConnectionString = config.server.iot_beacon_key//Place your own connection string
let sendInterval;

function disconnectHandler () {
  clearInterval(sendInterval);
  client.open().catch((err) => {
    console.error(err.message);
  });
}

// The AMQP and HTTP transports have the notion of completing, rejecting or abandoning the message.
// For example, this is only functional in AMQP and HTTP:
// client.complete(msg, printResultFor('completed'));
// If using MQTT calls to complete, reject, or abandon are no-ops.
// When completing a message, the service that sent the C2D message is notified that the message has been processed.
// When rejecting a message, the service that sent the C2D message is notified that the message won't be processed by the device. the method to use is client.reject(msg, callback).
// When abandoning the message, IoT Hub will immediately try to resend it. The method to use is client.abandon(msg, callback).
// MQTT is simpler: it accepts the message by default, and doesn't support rejecting or abandoning a message.
function messageHandler (msg) {
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
  client.complete(msg, printResultFor('completed'));
}



function errorCallback (err) {
  console.error(err.message);
}

function beaconCallback () {

/////////////////////////////////////////////////////////////////////////////////////
// TO USE ANOTHER CLOUD PLATEFORM JUST CHANGE THE CODE NOT IN PRACKET WITH THE GOOD API
// Search for each room if they are occupied, if the are occupied but no android client have send a request in the last minute, they are considered as unoccupied
/////////////////////////////////////////////////////////////////////////////////////

  console.log('Client connected');
  // Create a message and send it to the IoT Hub every two seconds
  sendInterval = setInterval(() => {
db.rooms.forEach(function(room, index){
	
	if(((new Date) - room.last_time_since_occupied) > ONE_MINUTE){
		room.is_occupied = 0;
	}
	
	// IS USED TO INTERACT WITH THE OTHER NODEJS MODULE
	// DUE TO TIME CONSTRAINS OF THE LAB WE USE THIS SOLUTION
	// IN FUTUR UPDATE THE DATA WILL BE DIRECTLY DOWNLOAD FROM THE CLOUD
	let content = JSON.parse(fs.readFileSync(file, 'utf8'));
	content.rooms[index].is_occupied = room.is_occupied;
	fs.writeFileSync(file, JSON.stringify(content));
	
	var data = JSON.stringify({
		messageId : "beacon2",
		time : new Date(),
		is_occupied : room.is_occupied,
		id_room : room.id
		});
	
	console.log(data);
/////////////////////////////////////////////////////////////////////////////////////

	var message = new Message(data);
	client_beacon.sendEvent(message, printResultFor('send'));

});

  }, 6000);

}

// fromConnectionString must specify a transport constructor, coming from any transport package.
let client_beacon = Client.fromConnectionString(deviceConnectionString, Protocol);

client_beacon.on('connect', beaconCallback);
client_beacon.on('error', errorCallback);
client_beacon.on('disconnect', disconnectHandler);
client_beacon.on('message', messageHandler);

client_beacon.open()
.catch(err => {
  console.error('Could not connect: ' + err.message);
});

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}


/////////////////////////////////////////////////////////////////////////////////////
// TO USE ANOTHER CLOUD PLATEFORM JUST CHANGE THE CODE NOT IN PRACKET WITH THE GOOD API
// Wait for post request to indiquate that a room is occupied
/////////////////////////////////////////////////////////////////////////////////////
app.post('/beacon', function (req, res) {

	console.log(req.body.room);

	db.rooms.forEach(function(room){
	
		if(room.id == req.body.room){
			room.is_occupied = 1;
			room.last_time_since_occupied = new Date();
		}
		console.log(room.is_occupied);
	
	});
	return res.send('Ok');
    
});

app.listen(config.server.port_beacon_REST, function(){
	console.log('Server listening on port 3000');
});

////////////////////////////////////////////////////////////////////////////////////////////
