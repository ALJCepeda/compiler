	var fs = require("fs"),
	p = require("path"),
	Promise = require("promise"),
	Bare = require("bareutil"),
	O = Bare.Obj;

var Filer = function(root, mode) {
	this.root = root || "/";
	this.mode = mode || 0644;
};

Filer.prototype.create = function(docs) {
	var self = this;

	return this.directory(this.root, this.mode).then(function() {
		return self.documents(docs);
	});
};

Filer.prototype.remove = function(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(path, function(err, files) {
			if(err) reject(err);
			var promises = [];

			files.forEach(function(file) {
				console.log(file);
				var promise = new Promise(function(resolve, reject) {
					var filePath = p.join(path, file);
					fs.unlink(filePath, function(err) {
						if(err) reject(err);

						resolve();
					});
				});

				promises.push(promise);
			});

			var promise = new Promise(function(resolve, reject) {
				fs.rmdir(path, function(err) {
					if(err) reject(err);
					resolve();
				});
			});
			promises.push(promise);

			resolve(Promise.all(promises));
		});
	});
};

Filer.prototype.cleanup = function() {
	return this.remove(this.root);
};

Filer.prototype.directory = function(dir, mode) {
	return new Promise(function(resolve, reject) {
		fs.mkdir(dir, mode, function(err) {
			if(err) return reject(err);
			resolve();
		});
	});
};

Filer.prototype.documents = function(docs) {
	var self = this;
	var promises = [];

	O.each(docs, function(content, name) {
		var promise = new Promise(function(resolve, reject) {
			var path = "./" + p.join(self.root, name+".php");

			fs.open(path, "w", function(err, fd) {
				if(err) reject(err);
				else {
					fs.write(fd, content);
					console.log("written");
					resolve(true);
				}
			});
		});

		promises.push(promise);
	});

	return Promise.all(promises);
};

module.exports = Filer;
