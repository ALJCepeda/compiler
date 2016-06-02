var tape = require("tape");
var Coder = require("./../scripts/coder");

tape("create", function(t) {
	var coder = new Coder("ajrelic", "/tmp", 0777);
	var project = {
		id:"test",
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
			"sudo docker run --name=\"test\" --rm --volume=\"/tmp/test:/scripts\" --workdir=\"/scripts\" php:5.6 php index.php",
			"Correct docker command"
		);

	}).catch(t.fail).done(function() {
		coder.filer.cleanup();
		t.end();
	});
});
