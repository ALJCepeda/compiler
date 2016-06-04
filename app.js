var zmq = require('zmq');
var Coder = require("./scripts/coder");

var WORK_URL = "tcp://127.0.0.1:3000";

var rep = zmq.socket("rep");
rep.identity = "server" + process.pid;

rep.connect(WORK_URL);
rep.on("message", function(data) {
	var project = JSON.parse(data);

	var coder = new Coder("aljcepeda", "tmp", 0777);
	coder.run(project).then(function(result) {
		return result;
	}).catch(function(err) {
		console.log("Error:", err);
		return err;
	}).done(function(result) {
		var data = JSON.stringify(result);

		return coder.filer.cleanup().catch(function(err) {
			console.log("Filer.cleanup:", err);
		}).done(function() {
			rep.send(data);
		});
	});
});

console.log("Bound to:", WORK_URL);
