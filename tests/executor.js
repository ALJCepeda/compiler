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

    tape('generateNewSave', function(t) {
        t.true(projectA.valid(), 'ProjectA is a valid Project');
        t.false(projectA.valid('insert'), 'ProjectA is not valid for insert');

        executor.generateNewSave(projectA).then(function(project) {
            t.true(project.valid('insert'), 'ProjectA is now valid for insert');
        }).catch(t.fail).done(t.end);
    });

    tape('run', function(t) {
        executor.run(projectA).then(function(result) {
            t.equal(
                result.save.stdout,
                'Hello NodeJS!\n',
                'ProjectA correctly compiled'
            );
        }).catch(t.fail).done(t.end);
    });

    var phpProject = {
        platform: 'php',
        tag: '5.6',
        save: null,
        documents: {    index:
                        {   id: 'index',
                            extension: 'php',
                            content: '<?php echo \'Hello World!\';'  }
        }
    };
    tape('respond', function(t) {
        var firstResult;
        executor.respond(phpProject).then(function(result) {
            t.pass('phpProject was compiled');
            t.equal(
                result.save.stdout,
                'Hello World!',
                'phpProject has correct output'
            );

            firstResult = result;
            return executor.respond(result);
        }).then(function(result) {
            t.pass('phpProject was not recompiled');
            t.equal(
                result.save.stdout,
                'Hello World!',
                'phpProject output was fetched from database'
            );

            result.documents.index.content = '<?php echo \'Hello PHP!\';';
            return executor.respond(result);
        }).then(function(result) {
            t.pass('phpProject a new save was inserted');
            t.notEqual(result.save.id, firstResult.save.id, 'New saveIDs for new content');
            t.equal(result.save.parent, firstResult.save.id, 'New save\'s parent is old saveID');
            t.equal(result.save.stdout, 'Hello PHP!', 'Correct output from new content');

            return executor.agent.projectDelete(result);
        }).then(function(count) {
            t.equal(count, 1, 'phpProject was deleted');
        }).catch(t.fail).done(t.end);
    });

    var invalidProject = {
        tag: '5.6',
        save: null,
        documents: {    index:
                        {   id: 'index',
                            extension: 'php',
                            content: '<?php echo \'Hello World!\';'  }
        }
    };

    tape('respond - no platform', function(t) {
        executor.respond(invalidProject).then(function(result) {
            t.equal(
                Object.prototype.toString.call(result),
                '[object Error]',
                'invalidProject resolved an Error object'
            );
            t.end();
        }).catch(t.fail);
    });
});
