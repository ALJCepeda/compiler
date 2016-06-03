var zmq = require('zmq');
var Coder = require("./scripts/coder");

var WORK_URL = "tcp://localhost:3000";

var rep = zmq.socket("rep");
rep.identity = "server" + process.pid;

rep.connect(WORK_URL);
rep.on("message", function(data) {
	console.log("Recieved:");
	var project = JSON.parse(data);

	var coder = new Coder("aljcepeda", "tmp", 0777);
	coder.run(project).then(function(result) {
		rep.send(result.stdout);
	}).catch(function(err) {
		console.log("Error:", err);
		rep.send(err);
	});
});

console.log("Bound to:", WORK_URL);
