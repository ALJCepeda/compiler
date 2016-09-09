var path = require('path');
var Docktainer = require('docktainer');
var bare = require('bareutil');
var val = bare.val;
var misc = bare.misc;

var Filer = require('./filer');

var Coder = function(repository, executeInfo, root, mode) {
	this.container = null;
	this.filer = null;

	this.executeInfo = executeInfo;
	this.repository = repository;
	this.root = root || 'tmp';
	this.mode = mode || 0740;
	this.idlength = 8;

	this.onTimeout;
	this.onOverflow;
};

Coder.prototype.run = function(project, options) {
	var platformInfo = this.executeInfo[project.platform];
	if(val.undefined(platformInfo)) {
		throw new Error('Unrecognized platform');
	}

    var desc = platformInfo[project.tag];
    if(val.undefined(desc)) {
        desc = platformInfo['latest'];
    }

	var self = this;
	return this.write(project).then(function() {
        if(desc.compile !== null) {
            return self.execute(project, desc.compile, options);
        }

		return Promise.resolve();
    }).then(function(result) {
		if(result){
			//TODO: Ugly hack for pascal that needs to be fixed
			if( (result.stderr !== '' && result.stderr.indexOf('/usr/bin/ld: warning: ') === -1) ||
				result.stdout.indexOf('Fatal:') !== -1) {
					result.error = 'Error encountered while compiling';
					return result;
			}
		}

        return self.execute(project, desc.run, options);
    });
};

Coder.prototype.execute = function(project, desc, options) {
    var directory = this.directory(project.save.id);
	var name = misc.supplant('$0/$1', [this.repository, project.platform]);
	var volume = misc.supplant('$0:$1', [directory, options.workDIR]);

	var innerArgs = desc.split(' ');
	var innerCMD = innerArgs.shift();

	var dockerArgs = [
		'--rm',
		'--name', project.save.id,
		'--volume', volume
	];

	if(val.defined(options['cpu-shares'])) {
		dockerArgs.push('--cpu-shares', options['cpu-shares']);
	}
	if(val.defined(options.memory)) {
		dockerArgs.push('--memory', options.memory);
	}
	if(val.defined(options.workDIR)) {
		dockerArgs.push('-w', options.workDIR);
	}

	var command = new Docktainer.Command(this.repository, project.platform, project.tag, dockerArgs, innerCMD, innerArgs);
	command.sudo = false;
	if(val.defined(options.sudo)) {
		command.sudo = options.sudo;
	}

	var container = new Docktainer.Container(command);
	if(val.defined(options.timeout)) {
		container.timeout = options.timeout;
	}
	if(val.defined(options.bufferLimit)) {
		container.bufferLimit = options.bufferLimit;
	}

	container.onTimeout = this.onTimeout;
	container.onOverflow = this.onOverflow;

	return container.exec();
};

Coder.prototype.directory = function(relative) {
    var dir = path.resolve(this.root, relative);
    return dir;
};

Coder.prototype.write = function(project) {
	var dir = this.directory(project.save.id);
	this.filer = new Filer(dir, this.mode);
	return this.filer.create(project.documents);
};

Coder.prototype.cleanup = function() {
    this.filer.cleanup();
};

module.exports = Coder;
