var zmq = require('zmq');
var Coder = require('./scripts/coder');
var PGClient = require('./../eval_pgclient');
var bare = require('bareutil');
var misc = bare.misc;

var WORK_URL = 'tcp://127.0.0.1:3000';
var idlength = 8;

var rep = zmq.socket('router');
rep.identity = 'server' + process.pid;

var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');
pgdb.execute().then(function(executeInfo) {
	rep.on('message', function() {
		var args = Array.apply(null, arguments);
		var identity = args[0];
		var data = args[2];

		console.log('Question ', identity.toString());

		var project = JSON.parse(data);
		var coder = new Coder('aljcepeda', executeInfo);
		var execStep;

		if(misc.defined(project.id) && (misc.undefined(project.saveid) ||  project.saveid ==='')) {
			console.log('Invalid Project:', project.id, 'has no saveid', project.saveid);
			return rep.send([ identity, '', 'Unable to compile project']);
		} else if( misc.undefined(project.id) ) {
			
		} else {
			execStep = Promise.resolve(project);

		}


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
		});
	});

	rep.bind(WORK_URL, function(err) {
		if(err) throw err;
		else {
			console.log('Bound to:', WORK_URL);
		}
	});
});
