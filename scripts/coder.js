
var descriptors = require("./descriptors");
var Docktainer = require("./../../docktainer");
var Bare = require("bareutil");
var Val = Bare.Val;
var path = require("path");
var Promise = require("promise");
var Filer = require("./filer");

var Coder = function(repository, sudo, killAfter) {
	this.repository = repository;
	this.sudo = sudo || true;
	this.killAfter = killAfter || 60;
};

Coder.prototype.run = function(project) {
	var id = project.id;
	var lang = project.language;
	var version = project.version;

	var desc = descriptors[lang];

	if(Val.defined(desc) === false || desc.hasVersion(version) === false) {
		return Promise.reject("The language or version provided is invalid");
	}

	return this.execute(project, desc);
};

Coder.prototype.execute = function(project, desc) {
	var name = project.language;
	if(Val.defined(this.repo) === true) {
		name = Bare.supplant("$0/$1", [this.repository, project.language]);
	}

	return this.write(project);
	//console.log();
	/*
	var inner = desc.generate("run", project.documents.index);
	var container = new Docktainer.Container(name, project.version, inner);

	var cmd = container.generate("run");
	return Promise.resolve(cmd);*/
	/*
	return container.run().then(function(result) {
		console.log(result);
	}).catch(function(err) {
		console.log(err);
	});*/
};

Coder.prototype.write = function(project) {
	var dir = path.join("tmp", project.id);
	var filer = new Filer(dir, 0644);
	return filer.create(project.documents);
};

module.exports = Coder;
