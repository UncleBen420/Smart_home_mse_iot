#Configure the AWS CLI with your AWS region, leave access/private keys blank
aws configure

#Create an IAM policy for the bridge
aws iot create-policy --policy-name bridgeMQTT --policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Action": "iot:*","Resource": "*"}]}'

#Place yourself in Mosquitto directory and download the Amazon Root CA #certificate
cd /etc/mosquitto/certs/
sudo wget https://www.amazontrust.com/repository/AmazonRootCA1.pem -O rootCA.pem

#Create certificates and keys. Make a note of the certificate ARN as it will be #needed to configure the IoT Policy.
sudo aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile cert.crt --private-key-outfile private.key --public-key-outfile public.key --region us-east-1

#Copy the ARN of the certificate returned by the command line in the form of #arn:aws:iot:us-east-1:0123456789:cert/xyzxyz and replace it in the following #command line in order to attach the IoT policy to your certificate
aws iot attach-principal-policy --policy-name bridgeMQTT --principal <certificate ARN>

#Add read permissions to the private key and the public certificate
sudo chmod 644 private.key
sudo chmod 644 cert.crt
