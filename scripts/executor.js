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
    this.coder = null;
};

var invalidError = {
    error: 'INVALID PROJECT',
    message: 'Unable to compile project'
};

Executor.prototype.appStarted = function() {
    var self = this;
    return this.agent.execute().then(function(info) {
        self.coder = new Coder('aljcepeda', info);
        return info;
    });
}

Executor.prototype.respond = function(data) {
    var self = this;
    var inputProj = new Project(data);

    if(inputProj.valid() === false) {
        return Promise.resolve(new Error('Input is not a valid Project'));
    }

    //This promise guaranteed to have a project reference for later
    var projectPromise;
    if(inputProj.hasRecord() === true) {
        projectPromise = this.agent.projectSaveSelect(inputProj.id, inputProj.save.id).then(function(selProj) {
            if(selProj === false) {
                return new Error('Cannot select save');
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
            return new Error('Project is not a valid insert');
        }

        if(project.save.hasOutput() === true) {
            return Promise.resolve(project);
        }

        return self.run(project).then(function(ranProject) {
            var insertPromise;
            if(ranProject.save.isRoot() === true) {
                insertPromise = self.agent.projectInsert(ranProject);
            } else {
                insertPromise = self.agent.saveInsert(ranProject);
            }

            return insertPromise.then(function(count) {
                if(count === 0) {
                    console.log('No rows were inserted for project:', ranProject);
                    return new Error('Unable to save project');
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
    return this.coder.run(project).then(function(result) {
        self.coder.cleanup();

        project.save.stdout = result.stdout;
        project.save.stderr = result.stderr;

        return project;
    });
};
/*

Executor.prototype.execute = function(project) {
    if(misc.defined(project.id) && misc.undefined(project.saveid)) {
        return Promise.reject('Invalid Project: ' + project.id + ' has no saveid ' + project.saveid);
    }

    var execChain;
    if(misc.undefined(project.id)) {
        //New project
        //Generate project id and save id, compile and respond
        execChain = pgdb.projectID_generate(this.idlength).then(function(id) {
            project.id = id;
            return projectSaveID_generate(id, this.idlength);
        }).then(function(saveid) {
            project.saveid = saveid;
            return project;
        });
    } else if(misc.defined(project.id) && misc.defined(project.saveid)) {
        execChain = pgdb.projectSave_select(project.id, project.saveid).then(function(save) {
            //Compare and see if any changes occurred
        });
    }
};*/

module.exports = Executor;
