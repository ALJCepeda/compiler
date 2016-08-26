var bare = require('bareutil');
var misc = bare.misc;
var val = bare.val;

var eval_shared = require('eval_shared');
var Save = eval_shared.Save;
var Project = eval_shared.Project;
var Agent = eval_shared.PGAgent;

var Coder = require('./coder');

var Executor = function(url) {
    this.agent = new Agent(url);
    this.executeInfo = {};
};

var invalidError = {
    error: 'INVALID PROJECT',
    message: 'Unable to compile project'
};

Executor.prototype.appStarted = function() {
    var self = this;
    return this.agent.execute().then(function(info) {
        self.executeInfo = info;
        return info;
    });
}

Executor.prototype.respond = function(data) {
    var self = this;
    var inputProj = new Project(data);

    if(inputProj.valid() === false) {
        return Promise.reject(new Error('Input is not a valid Project'));
    }

    //This promise guaranteed to have a project reference for later
    var projectPromise;
    if(inputProj.hasRecord() === true) {
        projectPromise = this.agent.projectSaveSelect(inputProj.id, inputProj.save.id).then(function(selProj) {
            if(selProj === false) {
                throw new Error('Cannot select save');
            } else if(inputProj.identical(selProj)) {
                return selProj;
            } else {
                return self.generateSave(inputProj);
            }
        });
    } else {
        projectPromise = this.generateNewSave(inputProj);
    }

    return projectPromise.then(function(project) {
        if(project.valid('insert') === false) {
            throw new Error('Project is not a valid insert');
        }

        if(project.save.hasOutput() === true) {
            return project;
        }

        return self.run(project).then(function(ranProject) {
            var insertPromise;
            if(ranProject.save.isRoot() === true) {
                insertPromise = self.agent.projectInsert(ranProject);
            } else if(ranProject.save.hasParent() === true){
                insertPromise = self.agent.saveInsert(ranProject);
            } else {
                //This should never occur
                throw new Error('Project is neither root nor has parent');
            }

            return insertPromise.then(function(count) {
                if(count === 0) {
                    throw new Error('No rows were inserted');
                }

                return ranProject;
            });
        });;
    })
};

Executor.prototype.generateNewSave = function(project) {
    var self = this;
    return this.agent.generateProjectID(Project.IDLength).then(function(id) {
        project.id = id;
        return self.agent.generateSaveID(id, Save.IDLength);
    }).then(function(id) {
        project.save = new Save({ id:id, root:id });
        return project;
    });
};

Executor.prototype.generateSave = function(project) {
    var self = this;

    return this.agent.generateSaveID(project.id, Save.IDLength).then(function(id) {
        project.save = new Save({ id:id, parent:project.save.id, root:project.save.root });
        return project;
    })
}

Executor.prototype.run = function(project) {
    var self = this;
    var coder = new Coder('aljcepeda', this.executeInfo);

    coder.onOverflow = function() {
        console.log('onOverflow was called for:', project.id, project.save.id);
    };
    coder.onTimeout = function() {
        console.log('onTimeout was called for:', project.id, project.save.id);
    };
    return coder.run(project).then(function(result) {
        coder.cleanup();

        project.save.stdout = result.stdout;
        project.save.stderr = result.stderr;

        return project;
    });
};

module.exports = Executor;
