var zmq = require("zmq"),
	pull = zmq.socket("pull"),
	push = zmq.socket("push");

pull.connect("tcp://127.0.0.1:3000");
console.log("Worker(pull) connected to port 3000");

push.bindSync("tcp://127.0.0.1:3001");
console.log("Worker(push) connected to port 3001");

pull.on("message", function(msg) {
	console.log("Work: ", msg.toString());
	setTimeout(function() {
		console.log("Result: ", msg.toString());
		var value = parseInt(msg);
		value = value * 10;
		push.send(value);
	}, 1000);
});
