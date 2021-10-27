const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const { spawnSync } = require("child_process");
const config = require('../config/default.json');

// Pseudo Database, should be replace
const fs = require('fs');
const file = '../config/local_database.json';
const db = require(file);

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var deviceConnectionString = config.server.iot_radiator_key//Place your own connection string
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

function radiatorCallback () {

/////////////////////////////////////////////////////////////////////////////////////
// TO USE ANOTHER CLOUD PLATEFORM JUST CHANGE THE CODE NOT IN PRACKET WITH THE GOOD API
// Get the radiators in each rooms, read their status and send it to the iot platform device
/////////////////////////////////////////////////////////////////////////////////////

  console.log('Client connected');
  // Create a message and send it to the IoT Hub every two seconds
  sendInterval = setInterval(() => {
db.rooms.forEach(function(room){
	room.radiators.forEach(function(radiator) {
	var num = -1;
	const cmd = spawnSync(config.server.PATH_knx, ['raw', '0/4/' + radiator, '0', '1', '0']);
				
	if(cmd.stdout.toString()){
		
		res_str = cmd.stdout.toString();
		res_str = res_str.slice(0, -5);
		var num = res_str.replace(/\D/g, '');
	}

	var data = JSON.stringify({
		messageId: "radiator",
		time:new Date(),
		radiator_number:radiator,
		value:num,
		room_id:room.id
		});
	
	console.log(data);
	
///////////////////////////////////////////////////////////////////////////////////
	
	var message = new Message(data);
	client_radiator.sendEvent(message, printResultFor('send'));
	});
});

  }, 20000);

}

// fromConnectionString must specify a transport constructor, coming from any transport package.
let client_radiator = Client.fromConnectionString(deviceConnectionString, Protocol);

client_radiator.on('connect', radiatorCallback);
client_radiator.on('error', errorCallback);
client_radiator.on('disconnect', disconnectHandler);
client_radiator.on('message', messageHandler);

client_radiator.open()
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
