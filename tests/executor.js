var tape = require('tape');
var Project = require('eval_shared').Project;
var Executor = require('./../scripts/executor');

var executor = new Executor('postgres://vagrant:password@localhost/eval');
var xtape = function(name) { console.log('Manually skipped:', name); };

executor.appStarted().then(function(info) {
    var projectA = new Project({    id: 'atest',
                        platform: 'nodejs',
                        tag: 'latest',
                        save: null,
                        documents: {    index:
                                        {   id: 'index',
                                            extension: 'js',
                                            content: 'console.log(\'Hello NodeJS!\')'  }
                        }
                    });

    xtape('generateNewSave', function(t) {
        t.true(projectA.valid(), 'ProjectA is a valid Project');
        t.false(projectA.valid('insert'), 'ProjectA is not valid for insert');

        executor.generateNewSave(projectA).then(function(project) {
            t.true(project.valid('insert'), 'ProjectA is now valid for insert');
        }).catch(t.fail).done(t.end);
    });

    tape('run', function(t) {
        executor.run(projectA).then(function(result) {
            console.log(result);
        });
    });
});
