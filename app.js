var zmq = require('zmq');
var Executor = require('./scripts/executor');
var bare = require('bareutil');
var eval_shared = require('eval_shared');

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

		console.log('Question:', identity.toString());

		

		return;
		//TODO: We're still executing, so compile, record output, ouput and return.
		var execStep;

		if(misc.defined(project.id) && (misc.undefined(project.saveid) ||  project.saveid ==='')) {
			console.log('Invalid Project:', project.id, 'has no saveid', project.saveid);
			return rep.send([ identity, '', 'Unable to compile project']);
		} else if( misc.undefined(project.id) ) {

		} else {
			execStep = Promise.resolve(project);

		}
/*

				console.log('Run ID:', id);
				return coder.run(project).then(function(result) {
					console.log('Finished ID:', id);
					result.id = id;
					return result;
				});
			})
		}
		.then(function(result) {
			console.log('Answer', identity.toString(), 'with', result.id);
			var answer = JSON.stringify(result);
			rep.send([ identity, '', answer ]);
		}).done(function() {
			coder.cleanup();
		});*/
	});
});

rep.bind(WORK_URL, function(err) {
	if(err) throw err;
	else {
		console.log('Bound to:', WORK_URL);
	}
});
