var http = require('http');
var Static = require('node-static');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var port = 8810;

var files = new Static.Server('./public');

function handler (request, response) {
	request.on('end', function() {
		files.serve(request, response);
	}).resume();
	}

io.set('log level', 1);

var testdata1='id: BDKJTY, active: active,'+
'coords: [{'+
	'lat:1.1.28035,'+
	'lng:103.103.836,'+
	'acr:acr'+
	'}]';

var testdata5=[
[1.30793,103.9413],
[1.34199,103.9253],
[1.37879,103.7652],
[1.30946,103.8172]];

// Que to pull data
var q = 'cdr_ui_queue';
var open = require('amqplib').connect('amqp://localhost');
var incomingMsg="";

io.sockets.on('connection', function (socket) {
	socket.on('send:coords', function (data) {
		open.then(function(conn) {
			  var ok = conn.createChannel();
			  var ch = null;
					ok = ok.then(function(ch) {
					    ch.assertQueue(q);
					    ch.consume(q, function(msg) {
					      if (msg !== null) {
					    	   incomingMsg=msg.content.toString();
					    	   console.log('--> new records found'+incomingMsg);
								io.sockets.emit('load:coords', incomingMsg);
					        ch.ack(msg);
					        
					      }
					    });
					  });
					  return ok;
					}).then(null, console.warn)
			 });

});

app.listen(port);
console.log('Your server goes on localhost:' + port);
// Try to close the connection after testing or else Rabbit MQ will throw connection refued error due to excess connections
