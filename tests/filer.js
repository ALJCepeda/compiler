var tape = require("tape"),
	Filer = require("./../scripts/filer.js"),
	fs = require("fs"),
	Promise = require("promise");

tape("create", function(t) {
	var filer = new Filer("tmp", 0644);
	filer.create({
		test:"Hello World",
		foo:"bar"
	}).then(function() {
		var a = new Promise(function(resolve, reject) {
			fs.stat("tmp/test", function(err, stats) {
				if(err) return reject(err);
				if(stats.isFile() !== true) return reject("test is not a file");

				return resolve();
			});
		});

		var b = new Promise(function(resolve, reject) {
			fs.stat("tmp/foo", function(err, stats) {
				if(err) return reject(err);
				if(stats.isFile() !== true) return reject("foo is not a file");

				return resolve();
			});
		});

		return Promise.all([a, b]);
	}).then(function() {
		t.pass("All files were created correctly");
		return filer.cleanup();
	}).then(function() {
		return new Promise(function(resolve, reject) {
			fs.stat("tmp", function(err, stats) {
				if(err.code === "ENOENT") return resolve();
				return reject("tmp directory still exists");
			});
		});
	}).then(function() {
		t.pass("Everything was cleaned up");
	}).catch(function(err) {
		console.log(err);
		t.fail("Error encountered");
	}).done(t.end);
});
