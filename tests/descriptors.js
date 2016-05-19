var tape = require("tape");
var descriptors = require("../scripts/descriptors");

tape("php", function(t) {
	var php = descriptors.php;

	t.true(php.hasVersion("5.6"), "Has version 5.6");
	t.false(php.shouldCompile(), "Doesn't need a compile step");

	t.equal(
		php.generateCMD("test"), "php test.php", "Generates command"
	);

	t.end();
});
