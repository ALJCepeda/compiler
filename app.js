var zmq = require('zmq');
var Executor = require('./scripts/executor');
var bare = require('bareutil');
var eval_shared = require('eval_shared');
var winston = require('winston');

winston.add(winston.transports.File, { filename:'log.txt' })
var misc = bare.misc;
var Project = eval_shared.Project;
var executor = new Executor('postgres://vagrant:password@localhost/eval');

var WORK_URL = 'tcp://127.0.0.1:3000';
var idlength = 8;

var rep = zmq.socket('router');
rep.identity = 'server' + process.pid;

executor.appStarted().then(function() {
	rep.on('message', function() {
		var args = Array.apply(null, arguments);
		var identity = args[0];
		var jsonString = args[2];
		var data = JSON.parse(jsonString);

		winston.info('Question From - ', identity.toString());
		executor.respond(data).then(function(project) {
			winston.info('Answering - ', identity.toString());
			var answer = JSON.stringify(project);
			rep.send([ identity, '', answer]);
		}).catch(function(error) {
			winston.error('Error - ', error);
			winston.error('Args - ', jsonString.toString());
			rep.send([ identity, '', '{"error": "Error encountered while attempting to compile project"}' ]);
		});
	});
});

rep.bind(WORK_URL, function(err) {
	if(err) throw err;
	else {
		winston.info('Bound to - ', WORK_URL);
	}
});
