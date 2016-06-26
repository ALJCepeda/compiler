var tape = require('tape');
var Coder = require('./../scripts/coder');
var PGClient = require('/sources/eval_pgclient');

var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');
var xtape = function(name) { console.log('Manually skipped:', name); };

pgdb.execute().then(function(executeInfo) {
	var coder = new Coder('aljcepeda', executeInfo, pgdb);

	tape('php', function(t) {
		var project = {
			platform:'php',
			tag:'5.6',
			documents: [
				{
					name:'index',
					ext:'php',
					content:'<?php \n\techo \'Hello World!\';'
				}
			]
		};

		coder.run(project).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!',
				'Hello PHP!'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('nodejs', function(t) {
		var project = {
			platform:'nodejs',
			tag:'latest',
			documents: [
				{
					name:'index',
					ext:'js',
					content:'console.log(\'Hello World!\')'
				}
			]
		};

		coder.run(project).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello NodeJS!'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('haskell', function(t) {
		var project = {
			platform:'haskell',
			tag:'latest',
			documents: [
				{
					name:'index',
					ext:'hs',
					content:'main = putStrLn "Hello World!";'
				}
			]
		};

		coder.run(project).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello Haskell!'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('pascal', function(t) {
		var project = {
			platform:'pascal',
			tag:'2.6.4',
			documents: [
				{
					name:'index',
					ext:'pas',
					content:"program Hello;\nbegin\n\twriteln('Hello World!');\nend."
				}
			]
		};

		coder.run(project).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello Pascal!'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});
});
