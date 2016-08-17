var misc = require('bareutil').misc;

var Executor = function(idlength, executeInfo) {
    this.executeInfo = executeInfo;
    this.idlength = idlength;
};

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
};

Executor.prototype.projects_equal = function(a, b) {
    if(a.id !== b.id) {
        console.log("Project ids don't match");
    }

    if(a.saveid !== b.saveid) {
        console.log("Project saveids don't match");
    }
};

Executor.prototype.
