#Update the list of repositories with one containing the latest version of #Mosquitto and update the package lists
sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
sudo apt-get update

#Install the Mosquitto broker, Mosquitto clients and the aws cli
sudo apt-get install mosquitto
sudo apt-get install mosquitto-clients
sudo apt install awscli
