var Descriptor = require("./descriptor");

var php = new Descriptor({
	language:"php",
	ext:"php",
	versions: [ "5.4", "5.5", "5.6" ],
	run: "php {file}.php",
	mounts: [{
		host:"/var/www/node/eval/resources/configs/php.ini",
		guest:"/usr/local/etc/php/php.ini"
	}],
	precode: "<?php\n\techo \"Hello World!\";"
});

var nodejs = new Descriptor({
	language:"nodejs",
	ext:"js",
	versions: [ "0.12.7", "latest" ],
	run: "node {file}.js",
	precode:"console.log(\"Hello World!\");"
});

var haskell = new Descriptor({
	language:"haskell",
	ext:"hs",
	versions: [ "7.10.2", "latest" ],
	precode: "main = putStrLn \"Hello World!\";",
	run: "./{file}.hs",
	compile: "ghc -o {file} {file}.hs"
});

var pascal = new Descriptor({
	language:"pascal",
	ext:"pas",
	versions: [ "2.6.4", "latest" ],
	precode: "program Hello;\nbegin\n\twriteln (\"Hello World!\");\nend.",
	run: "./{file}.pas",
	compile:"fpc {file}.pas",
	removals: [
		"Free((.*)\n(.*)\n(.*))i386\n",
		"\(normal if you did not specify a source file to be compiled\)"
	],
});

module.exports = {
	php:php,
	nodejs:nodejs,
	haskell:haskell,
	pascal:pascal
};
