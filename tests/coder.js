var tape = require("tape");
var Coder = require("./../scripts/coder");

tape("php", function(t) {
	var coder = new Coder("aljcepeda", "tmp", 0777);
	var project = {
		id:"php_test",
		language:"php",
		version:"5.6",
		documents: {
			index: {
				ext:"php",
				content:"<?php \n\techo \"Hello World!\";"
			}
		}
	};

	coder.run(project).then(function(result) {
		t.equal(
			result.stdout,
			"Hello World!",
			"Correctly outputs php code"
		);

		t.equal(
			result.command,
			"sudo docker run --name=\"php_test\" --rm --volume=\"/sources/compiler/tmp/php_test:/scripts\" --workdir=\"/scripts\" aljcepeda/php:5.6 php index.php",
			"Correct docker command"
		);

	}).catch(t.fail).done(function() {
		coder.filer.cleanup();
		t.end();
	});
});
/*
tape("nodejs", function(t) {
	var coder = new Coder("aljcepeda", "tmp", 0777);
	var project = {
		id:"nodejs_test",
		language:"nodejs",
		version:"latest",
		documents: {
			index: {
				ext:"js",
				content:"console.log(\"Hello World!\")"
			}
		}
	};

	coder.run(project).then(function(result) {
		t.equal(
			result.stdout,
			"Hello World!\n",
			"Correctly outputs javascript code"
		);

		t.equal(
			result.command,
			"sudo docker run --name=\"nodejs_test\" --rm --volume=\"/sources/compiler/tmp/nodejs_test:/scripts\" --workdir=\"/scripts\" aljcepeda/nodejs:latest node index.js",
			"Correct docker command"
		);
	}).catch(t.fail).done(function() {
		coder.filer.cleanup();
		t.end();
	});
});
*/
