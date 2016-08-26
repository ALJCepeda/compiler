var tape = require('tape');
var path = require('path');
var Docktainer = require('docktainer');
var Filer = require('./../scripts/filer');
var xtape = function(name) { console.log('Manually skipped:', name); };

var dockerOptions = [
    '--rm',
    '--cpu-shares',
    2,
    '--memory',
    '104M',
    '-w',
    '/scripts'
];

tape('haskell compilation', function(t) {
    var project = {
        id:'haskell',
        platform:'haskell',
        tag:'latest',
        documents: [
            {
                id:'index',
                extension:'hs',
                content:'main = putStrLn "Hello World!";'
            }
        ]
    };

    var desc = {
        platform: 'haskell',
        tag: 'latest',
        compile: 'ghc -o app index.hs',
        run: './app'
    };

    var haskellOptions = dockerOptions.slice();
    var dir = path.resolve('tmp', 'haskell');
    haskellOptions.push('--volume');
    haskellOptions.push(dir + ':/scripts');
    haskellOptions.push('--name');
    haskellOptions.push('haskell');

    filer = new Filer(dir, 0740);
	filer.create(project.documents).then(function() {
        var command = new Docktainer.Command('aljcepeda', 'haskell', 'latest', haskellOptions, 'ghc', [ '-o', 'app', 'index.hs' ]);
        console.log(command.build('run').join(' '));
        var container = new Docktainer.Container(command);
        container.timeout = 5000;
        container.onTimeout = function() {
            console.log('Container timed out:', project.id, project.save.id);
        };

        return container.exec();
    }).then(function(result) {
        var command = new Docktainer.Command('aljcepeda', 'haskell', 'latest', haskellOptions, './app');
        console.log(command.build('run').join(' '));
        var container = new Docktainer.Container(command);
        container.timeout = 5000;
        container.onTimeout = function() {
            console.log('Container timed out:', project.id, project.save.id);
        };

        return container.exec();
    }).then(function(result) {
        console.log(result);
    }).catch(t.fail).done(function() {
        filer.cleanup();
        t.end();
    });
});
