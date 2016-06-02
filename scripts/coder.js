var descriptors = require("./descriptors");
var Docktainer = require("./../../docktainer");
var Bare = require("bareutil");
var Val = Bare.Val;
var path = require("path");
var Promise = require("promise");
var Filer = require("./filer");

var Coder = function(repository, root, mode) {
	this.container = null;
	this.filer = null;

	this.repository = repository;
	this.root = root || "tmp";
	this.mode = mode || 0644;
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
	return this.write(project).then(function(result) {
		var inner = desc.generate("run", "index");

		var name = project.language;
		if(Val.defined(this.repository) === true) {
			name = Bare.supplant("$0/$1", [this.repository, project.language]);
		}

		var container = new Docktainer.Container(name, project.version, inner, {
			name:project.id,
			rm:true,
			volume:Bare.supplant("$0:$1", [result, "/scripts"]),
			workdir:"/scripts"
		});

		return container.run();
	});
};

Coder.prototype.write = function(project) {
	var dir = path.join(this.root, project.id);
	this.filer = new Filer(dir, this.mode);
	return this.filer.create(project.documents);
};

module.exports = Coder;
