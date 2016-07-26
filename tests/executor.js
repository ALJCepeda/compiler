var tape = require('tape');
var Project = require('eval_shared').Project;
var Executor = require('./../scripts/executor');

var executor = new Executor('postgres://vagrant:password@localhost/eval');
var xtape = function(name) { console.log('Manually skipped:', name); };

executor.appStarted().then(function(info) {
    var projectA = new Project({    id: '',
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

    xtape('run', function(t) {
        executor.run(projectA).then(function(result) {
            t.deepEqual(
                JSON.parse(result.save.output),
                {   stdout: 'Hello NodeJS!\n',
                    stderr: ''
                }, 'ProjectA correctly compiled'
            );

            return executor.agent.projectDelete(projectA);
        }).then(function(count) {
            t.equal(count, 1, 'ProjectA was deleted');
        }).catch(t.fail).done(t.end);
    });

    var projectB = {
        platform: 'php',
        tag: '5.6',
        save: null,
        documents: {    index:
                        {   id: 'index',
                            extension: 'php',
                            content: '<?php echo \'Hello World!\';'  }
        }
    }
    tape('respond', function(t) {
        executor.respond(projectB).then(function(result) {
            t.pass('ProjectB was compiled');
            t.equal(
                result.save.stdout,
                'Hello World!',
                'ProjectB has correct output'
            );

            return executor.agent.projectDelete(result);
        }).then(function(count) {
            t.equal(count, 1, 'ProjectB was deleted');
        }).catch(t.fail).done(t.end);
    })
});
