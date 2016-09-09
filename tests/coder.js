var path = require('path');
var tape = require('tape');
var Coder = require('./../scripts/coder');
var PGAgent = require('eval_shared').PGAgent;

var agent = new PGAgent(process.env.PSQL_EVAL);
var xtape = function(name) { console.log('Manually skipped:', name); };
var config = require(path.join(__dirname, '..', 'config'));

agent.execute().then(function(executeInfo) {
	var coder = new Coder('aljcepeda', executeInfo);
	var idlength = 7;

	var dockerOptions = {
        memory:'100M',
        'cpu-shares':'2',
        workDIR:'/scripts',
        timeout:2000,
        bufferLimit:40960
    };

	tape('php', function(t) {
		var project = {
			id:'php1234',
			platform:'php',
			tag:'5.6',
			save: {
				id:'php'
			},
			documents: [
				{
					id:'index',
					extension:'php',
					content:'<?php \n\techo \'Hello World!\';'
				}
			]
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!',
				'Hello PHP!'
			);
			t.equal(
				result.stderr,
				'',
				'PHP has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'PHP has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('php overflow', function(t) {
		var project = {
			id:'phpoverflow',
			platform:'php',
			tag:'5.6',
			save: {
				id:'phpoverflow'
			},
			documents: [
				{
					id:'index',
					extension:'php',
					content:'<?php \n\twhile(true) { echo \'Hello World!\'; }'
				}
			]
		};

		coder.onOverflow = function() {
			t.pass('onOverflow was called');
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.pass('Didn\'t blow up');
			t.equal(
				result.stderr,
				'',
				'PHPOverflow has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'PHPOverlow has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('php timeout', function(t) {
		var project = {
			id:'phptimeout',
			platform:'php',
			tag:'5.6',
			save: {
				id:'phptimeout'
			},
			documents: [
				{
					id:'index',
					extension:'php',
					content:'<?php \n\twhile(true) { }'
				}
			]
		};

		coder.onTimeout = function() {
			t.pass('onTimeout was called');
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.pass('Didn\'t run forever');
			t.equal(
				result.stderr,
				'',
				'PHPTimeout has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'PHPTimoue has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('nodejs', function(t) {
		var project = {
			id:'nodejs1',
			platform:'nodejs',
			tag:'latest',
			save: {
				id:'nodejs'
			},
			documents: [
				{
					id:'index',
					extension:'js',
					content:'console.log(\'Hello World!\')'
				}
			]
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello NodeJS!'
			);
			t.equal(
				result.stderr,
				'',
				'NodeJS has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'NodeJS has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('haskell', function(t) {
		var project = {
			id:'haskell',
			platform:'haskell',
			tag:'latest',
			save: {
				id:'haskell'
			},
			documents: [
				{
					id:'index',
					extension:'hs',
					content:'main = putStrLn "Hello World!";'
				}
			]
		};

		var desc = {
			platform: 'haskell',
  			tag: 'latest',
  			compile: 'ghc -o app index.hs',
  			run: './app'
		};

		coder.run(project, dockerOptions).then(function(result){
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello Haskell!'
			);
			t.equal(
				result.stderr,
				'',
				'Haskell has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'Haskell has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('haskell - failed compile', function(t) {
		var project = {
			id:'haskellfail',
			platform:'haskell',
			tag:'latest',
			save: {
				id: 'haskellfail'
			},
			documents: [
				{
					id:'index',
					extension:'hs',
					content:'main = putStrLn "Hello World!"; moo'
				}
			]
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.equal(
				result.stderr,
				'\nindex.hs:1:33: Parse error: naked expression at top level\n',
				'Haskell compile error'
			);
			t.equal(
				result.error,
				'Error encountered while compiling',
				'HaskellFail failed to compile error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('pascal', function(t) {
		var project = {
			id:'pascal',
			platform:'pascal',
			tag:'2.6.4',
			save: {
				id:'pascal'
			},
			documents: [
				{
					id:'index',
					extension:'pas',
					content:"program Hello;\nbegin\n\twriteln('Hello World!');\nend."
				}
			]
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.equal(
				result.stdout,
				'Hello World!\n',
				'Hello Pascal!'
			);
			t.equal(
				result.stderr,
				'',
				'Pascal has no stderrors'
			);
			t.equal(
				typeof result.error,
				'undefined',
				'Pascal has no process error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('pascal - failed compile', function(t) {
		var project = {
			id:'pascalfail',
			platform:'pascal',
			tag:'2.6.4',
			save: {
				id:'pascalfail'
			},
			documents: [
				{
					id:'index',
					extension:'pas',
					content:"program Hello;\nbegin\n\twriteln('Hello World!');mooo;\nend."
				}
			]
		};

		coder.run(project, dockerOptions).then(function(result) {
			t.equal(
				result.stdout,
				'Free Pascal Compiler version 2.6.4 [2014/03/03] for i386\nCopyright (c) 1993-2014 by Florian Klaempfl and others\nTarget OS: Linux for i386\nCompiling index.pas\nindex.pas(3,30) Error: Identifier not found "mooo"\nindex.pas(4,4) Fatal: There were 1 errors compiling module, stopping\nFatal: Compilation aborted\nError: /usr/bin/ppc386 returned an error exitcode (normal if you did not specify a source file to be compiled)\n',
				'Pascal compile error'
			);
			t.equal(
				result.stderr,
				'',
				'PascalFail has no stderrors'
			);
			t.equal(
				result.error,
				'Error encountered while compiling',
				'PascalFail failed to compile error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});
});
