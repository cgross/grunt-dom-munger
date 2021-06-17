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

function normalizeLineEndings(input) {
  return input && input.replace(new RegExp('\n|\r', 'g'), '');
}

exports.dom_munger = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);

    var actual = normalizeLineEndings(grunt.file.read('tmp/index.html'));
    var expected = normalizeLineEndings(grunt.file.read('test/expected/index.html'));
    test.equal(actual, expected, 'should update the html file correctly.');

    test.done();
  },
  custom_options: function(test) {
    test.expect(1);

    var actual = normalizeLineEndings(grunt.file.read('tmp/concated.css'));
    var expected = normalizeLineEndings(grunt.file.read('test/expected/concated.css'));
    test.equal(actual, expected, 'should create the concat-ed css file correctly.');

    test.done();
  },
  order: function(test) {
    test.expect(2);

    var actual = normalizeLineEndings(grunt.file.read('tmp/order.html'));
    var expected = normalizeLineEndings(grunt.file.read('test/expected/order.html'));
    test.equal(actual, expected, 'should update the file in the order expected.');

    actual = normalizeLineEndings(grunt.file.read('tmp/read_order.txt'));
    expected = normalizeLineEndings(grunt.file.read('test/expected/read_order.txt'));
    test.equal(actual, expected, 'should save the read elements ensuring that the elements were read before the HTML was updated.');

    test.done();
  },
  callback_return_false: function(test) {
    test.expect(1);

    var actual = normalizeLineEndings(grunt.file.read('test/fixtures/formatted.html'));
    var expected = normalizeLineEndings(grunt.file.read('test/fixtures/formatted_expected.html'));
    test.equal(actual, expected, 'should not modify the source files when callback returns false.');

    test.done();
  }
};
