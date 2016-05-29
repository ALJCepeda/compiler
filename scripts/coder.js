
var descriptors = require("./descriptors");
var Val = require("bareutil").Val;
var Promise = require("promise");

var Coder = function() { };
Coder.prototype.output = function(lang, version, docs) {
	var desc = descriptors[lang];

	if(Val.defined(desc) === false || desc.hasVersion(version) === false) {
		return false;
	}

	if(desc.shouldCompile() === true) {

	} else {
		return this.run(lang, version, code);
	}
};

Coder.prototype.run = function(lang, version, code) {

};
