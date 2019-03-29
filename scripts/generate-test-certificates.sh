#!/bin/sh
set -e

HOSTNAME=localhost

COUNTRY=SE
STATE=STOCKHOLM
CITY=STOCKHOLM
ORGANIZATION=ACME
ORGANIZATION_UNIT=.
EMAIL=webmaster@$HOSTNAME

DIR=ssl
CERT_PATH=$DIR/$HOSTNAME
CA_PATH=$DIR/CA
PASS=not-really-secret


# Create CA config file
cat > $CA_PATH.conf << EOF
basicConstraints=CA:TRUE

[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
input_password=$PASS

[dn]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORGANIZATION
OU = $ORGANIZATION_UNIT
emailAddress = $EMAIL
CN = $HOSTNAME
EOF

# Generate the root key
echo Generate the root key
openssl genrsa -des3 -passout pass:$PASS -out $CA_PATH.key 2048 

# Generate a root-certificate based on the root-key
echo Generate a root-certificate based on the root-key
openssl req -x509 -new -nodes \
	-key $CA_PATH.key \
	-days 1825 \
	-out $CA_PATH.pem \
	-config $CA_PATH.conf



# Create CERT config file
cat > $CERT_PATH.conf << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment

[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = $COUNTRY
ST = $STATE
L = $CITY
O = $ORGANIZATION
OU = $ORGANIZATION_UNIT
emailAddress = $EMAIL
CN = $HOSTNAME

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.$HOSTNAME
DNS.2 = $HOSTNAME
EOF

# Generate a new private key
echo Generate a new private key
openssl genrsa -out $CERT_PATH.key 2048

# Generate a Certificate Signing Request (CSR) based on that private key
echo Generate a Certificate Signing Request \(CSR\) based on that private key
openssl req -new -key $CERT_PATH.key -out $CERT_PATH.csr -config $CERT_PATH.conf

# Create the certificate for the webserver to serve
echo Create the certificate for the webserver to serve
openssl x509 -req \
	-in $CERT_PATH.csr -CA $CA_PATH.pem -CAkey $CA_PATH.key -CAcreateserial \
	-out $CERT_PATH.crt -days 1825 -extfile $CERT_PATH.conf \
	-passin pass:$PASS

echo ""
echo -e "\e[1;33mHey, you!\e[0m"
echo -e "\e[1;33mI've created a CA and a certificate for the local development" \
		"web server to use.\e[0m"
echo -e "\e[1;33mYou should add $CA_PATH.pem to your keychain/browser.\e[0m"
echo ""

