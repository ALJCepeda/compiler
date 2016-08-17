var bare = require("bareutil");
var obj = bare.obj;

var Descriptor = function(data) {
	this.language = "";
	this.run = "";
	this.compile = "";
	this.precode = "";
	this.mounts = [];
	this.removals = [];
	this.versions = [];

	obj.merge(this, data);
};

Descriptor.prototype.hasVersion = function(version) {
	return this.versions.indexOf(version) !== -1;
};

Descriptor.prototype.generate = function(action, file) {
	var result;
	switch(action) {
		case "run":
			result = Bare.supplant(this.run, { file:file });
		break;

		case "compile":
			result = Bare.supplant(this.compile, { file:file });
		break;
	}

	return result;
};

Descriptor.prototype.shouldCompile = function() {
	return this.compile !== "";
};

module.exports = Descriptor;
