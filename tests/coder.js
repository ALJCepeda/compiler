var tape = require('tape');
var Coder = require('./../scripts/coder');
var PGClient = require('/sources/eval_pgclient');

var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');
var xtape = function(name) { console.log('Manually skipped:', name); };

pgdb.execute().then(function(executeInfo) {
	var coder = new Coder('aljcepeda', executeInfo);
	var idlength = 7;

	tape('php', function(t) {
		pgdb.projectID_generate(idlength).then(function(id) {
			var project = {
				id:id,
				platform:'php',
				tag:'5.6',
				documents: [
					{
						id:'index',
						extension:'php',
						content:'<?php \n\techo \'Hello World!\';'
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {
				t.equal(
					result.stdout,
					'Hello World!',
					'Hello PHP!'
				);
		}).catch(t.fail)
		  .done(function() {
				coder.cleanup();
				t.end();
		});
	});

	tape('nodejs', function(t) {
		pgdb.projectID_generate(idlength).then(function(id) {
			var project = {
				id:id,
				platform:'nodejs',
				tag:'latest',
				documents: [
					{
						id:'index',
						extension:'js',
						content:'console.log(\'Hello World!\')'
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {
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
		pgdb.projectID_generate(idlength).then(function(id) {
			var project = {
				id:id,
				platform:'haskell',
				tag:'latest',
				documents: [
					{
						id:'index',
						extension:'hs',
						content:'main = putStrLn "Hello World!";'
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {
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

	tape('haskell - failed compile', function(t) {
		pgdb.projectID_generate(idlength).then(function(id) {
			var project = {
				id:id,
				platform:'haskell',
				tag:'latest',
				documents: [
					{
						id:'index',
						extension:'hs',
						content:'main = putStrLn "Hello World!"; moo'
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {
			t.equal(
				result.stderr,
				'\nindex.hs:1:33: Parse error: naked expression at top level\n',
				'Haskell compile error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});

	tape('pascal', function(t) {
		pgdb.projectID_generate(7).then(function(id) {
			var project = {
				id:id,
				platform:'pascal',
				tag:'2.6.4',
				documents: [
					{
						id:'index',
						extension:'pas',
						content:"program Hello;\nbegin\n\twriteln('Hello World!');\nend."
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {
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

	tape('pascal - failed compile', function(t) {
		pgdb.projectID_generate(7).then(function(id) {
			var project = {
				id:id,
				platform:'pascal',
				tag:'2.6.4',
				documents: [
					{
						id:'index',
						extension:'pas',
						content:"program Hello;\nbegin\n\twriteln('Hello World!');mooo;\nend."
					}
				]
			};

			return coder.run(project);
		}).then(function(result) {

			t.equal(
				result.stdout,
				'Free Pascal Compiler version 2.6.4 [2014/03/03] for i386\nCopyright (c) 1993-2014 by Florian Klaempfl and others\nTarget OS: Linux for i386\nCompiling index.pas\nindex.pas(3,30) Error: Identifier not found "mooo"\nindex.pas(4,4) Fatal: There were 1 errors compiling module, stopping\nFatal: Compilation aborted\nError: /usr/bin/ppc386 returned an error exitcode (normal if you did not specify a source file to be compiled)\n',
				'Pascal compile error'
			);
		}).catch(t.fail).done(function() {
			coder.cleanup();
			t.end();
		});
	});
});
