var fs = require('fs'),
p = require('path'),
Promise = require('bluebird'),
bare = require('bareutil'),
val = bare.val,
obj = bare.obj;
misc = bare.misc;

var Filer = function(root, mode) {
	this.root = root || '/';
	this.mode = mode || 0644;
};

Filer.prototype.create = function(docs) {
	if(val.object(docs) === true) {
		docs = obj.values(docs);
	}

	var self = this;
	return this.createDirectory(this.root, this.mode).then(function() {
		return self.createDocuments(self.root, self.mode, docs);
	}).then(function(test) {
		return p.resolve(self.root);
	});
};

Filer.prototype.remove = function(path) {
	return new Promise(function(resolve, reject) {
		fs.readdir(path, function(err, files) {
			if(err) throw err;
			var fileDel = [];

			files.forEach(function(file) {
				var promise = new Promise(function(res, rej) {
					var filePath = p.join(path, file);

					fs.unlink(filePath, function(err) {
						if(err) throw err;

						return res();
					});
				});

				fileDel.push(promise);
			});

			Promise.all(fileDel).then(function() {
				fs.rmdir(path, function(err) {
					if(err) throw err;
					return resolve();
				});
			});
		});
	});
};

Filer.prototype.cleanup = function() {
	return this.remove(this.root);
};

Filer.prototype.createDirectory = function(dir, mode) {

	return new Promise(function(resolve, reject) {
		fs.mkdir(dir, mode, function(err) {
			if(err) return reject(err);
			resolve();
		});
	});
};

Filer.prototype.createDocuments = function(root, mode, docs) {
	var promises = [];

	docs.forEach(function(doc) {
		var promise = new Promise(function(resolve, reject) {
			var filename = misc.supplant('$0.$1', [doc.id, doc.extension]);
			var path = p.join(root, filename);

			fs.open(path, 'w', mode, function(err, fd) {
				if(err) reject(err);
				else {
					fs.write(fd, doc.content);
					resolve(true);
				}
			});
		});

		promises.push(promise);
	});

	return Promise.all(promises);
};

module.exports = Filer;
