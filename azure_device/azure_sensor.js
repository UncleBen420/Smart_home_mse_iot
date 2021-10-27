const config = require('../config/default.json');

const fs = require('fs');
const file = '../config/local_database.json';
const db = require(file);

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

const https = require('http')
var options = {
  hostname: config.server.address_zwave,
  port: config.server.port_zwave,
  method: 'GET'
}


var deviceConnectionString = config.server.iot_sensor_key//Place your own connection string
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

function sensorCallback () {

/////////////////////////////////////////////////////////////////////////////////////
// TO USE ANOTHER CLOUD PLATEFORM JUST CHANGE THE CODE NOT IN PRACKET WITH THE GOOD API
// Search for each room if they are occupied, if the are occupied but no android client have send a request in the last minute, they are considered as unoccupied
/////////////////////////////////////////////////////////////////////////////////////

  console.log('Client connected');
  // Create a message and send it to the IoT Hub every two seconds
  sendInterval = setInterval(() => {
	db.rooms.forEach(function(room, index){
	
	options.path = '/sensor/' + room.dimmer_num + '/readings';
	const req = https.request(options, res => {
		res.on("data", function(chunk) {
			console.log("BODY: " + chunk);
			
			ret = JSON.parse(chunk);
			
			var data = JSON.stringify({
				"messageId" : "sensor",
				"time" : new Date().toISOString().slice(0, 19).replace('T', ' '),
				"temperature" : ret.temperature,
				"luminance" : ret.luminance,
				"humidity" : ret.humidity,
				"sensor" : ret.sensor,
				"id_room" : room.id			
			});
			
			// /!\ WORK AROUND
			// IS USED TO INTERACT WITH THE OTHER NODEJS MODULE
			// DUE TO TIME CONSTRAINS OF THE LAB WE USE THIS SOLUTION
			// IN FUTUR UPDATE THE DATA WILL BE DIRECTLY DOWNLOAD FROM THE CLOUD
			let content = JSON.parse(fs.readFileSync(file, 'utf8'));
			content.rooms[index].temperature = ret.temperature;
			content.rooms[index].luminance = ret.luminance;
			content.rooms[index].humidity = ret.humidity;
			fs.writeFileSync(file, JSON.stringify(content));
			
			console.log(data);
			var message = new Message(data);
			client_sensor.sendEvent(message, printResultFor('send'));
		});
	});
		
	req.end();	

});
/////////////////////////////////////////////////////////////////////////////////////
  }, 6000);

}

// fromConnectionString must specify a transport constructor, coming from any transport package.
let client_sensor = Client.fromConnectionString(deviceConnectionString, Protocol);

client_sensor.on('connect', sensorCallback);
client_sensor.on('error', errorCallback);
client_sensor.on('disconnect', disconnectHandler);
client_sensor.on('message', messageHandler);

client_sensor.open()
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

