const Server = require('mongodb-core').Server
     , assert = require('assert');
 
// Set up server connection 
const server = new Server({
    host: 'localhost'
  , port: 27017
  , reconnect: true
  , reconnectInterval: 50
});
 
// Add event listeners 
server.on('connect', function(_server) {
  console.log('connected!', 'disconnecting in 2 seconds');
  setTimeout(function(){
  	console.log('disconnecting now')
  	_server.destroy();
  }, 2000);
});
 
server.on('close', function() {
  console.log('closed');
});
 
server.on('reconnect', function() {
  console.log('reconnect');
});
 
// Start connection 
server.connect();
