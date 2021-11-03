#Retrieve the value of the AWS IoT Core ATS endpoint for your AWS Region using #the cli and make a note of it.
aws iot describe-endpoint --endpoint-type iot:Data-ATS

#Create the configuration file
sudo nano /etc/mosquitto/conf.d/bridge.conf

