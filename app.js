var zmq = require('zmq');
var Coder = require('./scripts/coder');
var PGClient = require('./../eval_pgclient');

var WORK_URL = 'tcp://127.0.0.1:3000';

var rep = zmq.socket('router');
rep.identity = 'server' + process.pid;

var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');
pgdb.execute().then(function(executeInfo) {
	console.log(executeInfo);

	rep.on('message', function() {
		var args = Array.apply(null, arguments);
		var identity = args[0];
		var data = args[2];
		var project = JSON.parse(data);

		var coder = new Coder('aljcepeda', 'tmp', 0777, executeInfo);
		coder.run(project).catch(function(err) {
			console.log('Error:', err);
			return err;
		}).done(function(result) {
			var answer = JSON.stringify(result);

			return coder.filer.cleanup().catch(function(err) {
				console.log('Filer.cleanup:', err);
			}).done(function() {
				rep.send([ identity, '', answer ]);
			});
		});
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
