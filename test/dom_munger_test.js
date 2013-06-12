'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.dom_munger = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/index.html');
    var expected = grunt.file.read('test/expected/index.html');
    test.equal(actual, expected, 'should update the html file correctly.');

    test.done();
  },
  custom_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/concated.css');
    var expected = grunt.file.read('test/expected/concated.css');
    test.equal(actual, expected, 'should create the concat-ed css file correctly.');

    test.done();
  },
  cheerio: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/index_cheerio.html');
    var expected = grunt.file.read('test/expected/index_cheerio.html');
    test.equal(actual, expected, 'should update the html file with CHEERIO correctly.');

    test.done();
  }  
};
