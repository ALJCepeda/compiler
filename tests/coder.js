var tape = require("tape");
var Coder = require("./../scripts/coder");

tape("create", function(t) {
	var coder = new Coder("ajrelic", true);
	var project = {
		id:"test",
		language:"php",
		version:"5.6",
		documents: {
			index:"<?php echo \"Hello World!\""
		}
	};

	coder.run(project).then(function(result) {
		console.log(result);
	}).catch(function(err) {
		console.log(err);
	}).done(t.end);
});
