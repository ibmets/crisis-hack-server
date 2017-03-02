$(document).ready(function() {
	socket = io.connect();
	socket.on('connect', function(data) {
	  console.log('socket.io connected to websocket server')

	});
});