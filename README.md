# Smart_home_mse_iot

## installation
npm install

### Commands to use the application


### read the value of a blind with the id 1
curl -X GET http://localhost:8083/blind -d 'id=1'

### read the value of a radiator with the id 1
curl -X GET http://localhost:8083/radiator -d 'id=1'

### write the value of the blinds in a room at 50%
curl -X POST http://localhost:8083/blind -d 'percent=50' -d 'room=32753'

### write the value of the radiator in a room at 50%
curl -X POST http://localhost:8083/radiator -d 'percent=50' -d 'room=32753'

### write the value of a dimmer at 50%
curl -X POST http://localhost:5000/dimmer/set_level -d 'node_id=4' -d 'value=50'

### enable the commands that will be automatically execute
curl -X POST http://localhost:8083/command -d 'command_1=1' -d 'command_2=1' -d 'command_3=1' -d 'command_4=1' 

## Comparaison

Communication entre device et iotCore, iothub, etc...
