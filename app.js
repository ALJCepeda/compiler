var zmq = require('zmq');
var Coder = require('./scripts/coder');
var PGClient = require('./../eval_pgclient');

var WORK_URL = 'tcp://127.0.0.1:3000';
var idlength = 7;

var rep = zmq.socket('router');
rep.identity = 'server' + process.pid;

var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');
pgdb.execute().then(function(executeInfo) {
	rep.on('message', function() {
		var args = Array.apply(null, arguments);
		var identity = args[0];
		var data = args[2];
		var project = JSON.parse(data);

		var coder = new Coder('aljcepeda', executeInfo);
		pgdb.generateID(idlength).then(function(id) {
			project.id = id;

			return coder.run(project);
		}).then(function(result) {
			var answer = JSON.stringify(result);
			rep.send([ identity, '', answer ]);
		}).done(coder.cleanup);
	});

	rep.bind('tcp://*:5555', function(err) {
		if(err) throw err;
		else {
			console.log('Bound to:', 'tcp://*:5555');
		}
	});
});

process.on('SIGINT', function() {
  rep.close();
});
