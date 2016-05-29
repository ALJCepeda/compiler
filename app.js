var Bare = require("./../bareutil"),
	zmq = require("zmq"),
	router = zmq.socket("router"),
	dealer = zmq.socket("dealer"),
	rep = zmq.socket("rep"),
 	routerURL = "tcp://127.0.0.1:3000",
	dealerURL = "tcp://127.0.0.1:3000";

var http = require('http');

var server = require("http").createServer(function(request, response) {
	request.on('error', function(err) {
    	console.error(err);
    	response.statusCode = 400;
    	response.end();
  	});
  	response.on('error', function(err) {
    	console.error(err);
  	});
  	if (request.method === 'GET' && request.url === '/echo') {
    	request.pipe(response);
  	}
}).listen(8080);
console.log("listening on *: ", 8080);

Bare.expose("/bareutil/misc.js", "val", server);
Bare.expose("/bareutil/moo.js", "misc", server);
Bare.expose("/bareutil/cow.js", "obj", server);

/*
router.bindSync(routerURL);
dealer.bindSync(dealerURL);

router.on('message', function() {
  // Note that separate message parts come as function arguments.
  var args = Array.apply(null, arguments);
  // Pass array of strings/buffers to send multipart messages.
  dealer.send(args);
});

dealer.on('message', function() {
  var args = Array.apply(null, arguments);
  router.send(args);
});

rep.bind(url, function(err) {
	if(err) throw err;

	console.log("Worker(rep) bound to: ", url);

	rep.on("message", function(data) {
		console.log("Work: ", data.toString());

		var value = parseInt(data) * 10;

		console.log("Result: ", value);
		rep.send(value);
	});
});
*/
