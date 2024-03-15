# ICD App

## Contenido
1. [General Info](#general-info)
2. [Local Installation](#local-installation)
3. [AWS Configuration](#aws-configuration)
# General Info
***
This documentation includes the general aspects to consider to run the app in a local environment and how it is deployed in a productive AWS environment.
# Local Installation
***
1. Instructions for local installation:
```
$ git clone https://github.com/govic02/DCI02.git
$ cd DCI02
$ npm install
$ npm install --save @fortawesome/fontawesome-svg-core
$ npm install --save @fortawesome/free-solid-svg-icons
$ npm install --save @fortawesome/react-fontawesome
$ nohup node server/server.js > server.log 2>&1
$ nohup npm start > npm.log 2>&1 &
```

2. Instructions for public installation:
- download the project sources:
  ```
  $ git clone https://github.com/govic02/DCI02.git
  ```
- edit the DCI02/src/config.js config file, declaring there the external IPv4 which be used for the application
  Before:
  ```
  let EXTERNAL_IPv4;
  ...
  ```
  After:
  ```
  let EXTERNAL_IPv4=10.20.30.40;
  // (Assuming 10.20.30.40 as your server's external IPv4 address)
  ...
  ```
- continue in the console with the same steps of the local installation: 
  ```
  $ cd DCI02
  $ npm install
  $ npm install --save @fortawesome/fontawesome-svg-core
  $ npm install --save @fortawesome/free-solid-svg-icons
  $ npm install --save @fortawesome/react-fontawesome
  $ nohup node server/server.js > server.log 2>&1
  $ nohup npm start > npm.log 2>&1 &
  ```

In some cases a problem could arise with the installation of deprecated dependencies, a possible solution is to use the ```npm i --legacy-peer-deps``` command.
# AWS Configuration
***
The configuration to deploy to a productive AWS environment is contained in the buildspec.yml file that indicates how AWS should install the dependencies to then be packaged and sent to the EC2 server managed by EBS.

There is also an additional configuration for the NGINX server contained in the root folder structure from .platform, the specific file is app.conf, this includes redefining the NGINX variables to control maximum upload file size and maximum wait time for requests.
