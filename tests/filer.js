var tape = require("tape"),
	Filer = require("./../scripts/filer.js");

tape("Directory", function(t) {
	var filer = new Filer("./tmp", 0644);
	filer.create({
		test:"Hello World",
		foo:"bar"
	}).then(function() {
		return filer.cleanup();
	}).then(function() {
		t.pass();
		t.end();
	}).catch(function(err) {
		console.log(err);
		t.fail();
		t.end();
	});
});
//bareutil pg promise tape uid zmq
