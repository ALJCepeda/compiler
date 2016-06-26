var path = require('path');
var Promise = require('promise');
var Filer = require('./filer');
var Docktainer = require('./../../docktainer');
var bare = require('bareutil');
var val = bare.val;
var misc = bare.misc;

function makeid(length) {
    var text = [];
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for( var i=0; i < length; i++ ) {
        var char = possible.charAt(Math.floor(Math.random() * possible.length));
		text.push(char);
	}

    return text.join('');
}

var Coder = function(repository, executeInfo, pgdb, root, mode) {
	this.container = null;
	this.filer = null;

	this.executeInfo = executeInfo;
	this.repository = repository;
	this.root = root || 'tmp';
	this.mode = mode || 0644;
	this.idlength = 8;

	this.db = pgdb;
};

Coder.prototype.generateID = function() {
	var id = makeid(this.idlength);

	return this.db.project_exist(id).then(function(exists) {
		if(exists === true) {
			return this.generateID();
		} else {
			return id;
		}
	}.bind(this));
};

Coder.prototype.run = function(project) {
	var platformlc = project.platform.toLowerCase();
	var platformExecute = this.executeInfo[platformlc];

	if(val.undefined(platformExecute)) {
		return Promise.reject('The language provided isn\'t valid');
	}

    var desc = platformExecute[project.tag];
    if(val.undefined(desc)) {
        desc = platformExecute['latest'];
    }

	return this.generateID().then(function(id) {
		project.id = id;
        return this.write(project);
    }.bind(this)).then(function() {
        if(desc.compile !== '') {
            return this.execute(project, desc.compile);
        }

        return Promise.resolve();
    }.bind(this)).then(function() {
        return this.execute(project, desc.run);
    }.bind(this));
};

Coder.prototype.execute = function(project, innerCMD) {
    var directory = this.directory(project.id);
	var name = misc.supplant('$0/$1', [this.repository, project.platform]);
	var volume = misc.supplant('$0:$1', [directory, '/scripts']);

	var command = new Docktainer.Command(name, project.tag, innerCMD, {
		name:project.id,
		rm:true,
		volume:volume,
		workdir:'/scripts'
	});

	var cmd = command.build('run');
	var container = new Docktainer.Container(cmd);
	return container.exec();
};

Coder.prototype.directory = function(relative) {
    var dir = path.resolve(this.root, relative);
    return dir;
};

Coder.prototype.write = function(project) {
	var dir = this.directory(project.id);
	this.filer = new Filer(dir, this.mode);
	return this.filer.create(project.documents);
};

Coder.prototype.cleanup = function() {
    this.filer.cleanup();
};

module.exports = Coder;
