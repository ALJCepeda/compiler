
var misc = require('bareutil').misc;
var eval_shared = require('eval_shared');
var Save = eval_shared.Save;
var Project = eval_shared.Project;
var Agent = eval_shared.PGAgent;

var Coder = require('./coder');

var Executor = function(url) {
    this.agent = new Agent(url);
    this.coder = null;
};

Executor.prototype.appStarted = function() {
    var self = this;
    return this.agent.execute().then(function(info) {
        self.coder = new Coder('aljcepeda', info);
        return info;
    });
}

Executor.prototype.generateNewSave =  function(project) {
    var self = this;
    return this.agent.generateProjectID(Project.IDLength).then(function(id) {
        project.id = id;
        return self.agent.generateSaveID(id, Save.IDLength);
    }).then(function(id) {
        project.save = new Save({ id:id, root:id });
        return project;
    });
};

Executor.prototype.run = function(project) {
    var self = this;
    return this.coder.run(project).then(function(result) {
        self.coder.cleanup();

        project.save.output = JSON.stringify({
            stdout:result.stdout,
            stderr:result.stderr
        });

        return new Promise(function(resolve, reject) {
            self.agent.projectInsert(function(count) {
                if(count === 0) {
                    console.log('No rows were inserted for project:', project);
                    return reject({
                        error:'INTERNAL ERROR',
                        message: 'Unable to save project'
                    });
                }

                resolve(project);
            }).catch(reject);
        });
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
