var Bare = require("bareutil");
var Obj = Bare.Obj;

var Descriptor = function(data) {
	this.repository = "";
	this.command = "";
	this.compile = "";
	this.precode = "";
	this.mounts = [];
	this.removals = [];
	this.versions = [];

	Obj.merge(this, data);
};

Descriptor.prototype.hasVersion = function(version) {
	return this.versions.indexOf(version) !== -1;
};

Descriptor.prototype.generateCMD = function(file) {
	return Bare.supplant(this.command, { file:file });
};

Descriptor.prototype.shouldCompile = function() {
	return this.compile !== "";
};



module.exports = Descriptor;
