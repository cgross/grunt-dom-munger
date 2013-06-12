/*
 * grunt-dom-munger
 * https://github.com/cgross/grunt-dom-munger
 *
 * Copyright (c) 2013 Chris Gross
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },
    // Configuration to be run (and then tested).
    dom_munger: {
      test: {
        options: {
          engine:'jsdom',
          read: {selector:'link',attribute:'href',writeto:'mylinks',isPath:true},
          remove: '#removeMe',
          update: {selector:'html',attribute:'appmode',value:'production'},
          append: {selector:'body',html:'<div id="appended">Im being appended</div>'}, 
          prepend: {selector:'body',html:'<span>Im being prepended</span>'},
          text: {selector:'title',text:'CHANGED TITLE'},
          callback: function($){
            $('#sample2').text('Ive been updated via callback');
          }
        },
        src: 'test/fixtures/index.html',
        dest: 'tmp/index.html'
      },
      test_cheerio: {
        options: {
          read: {selector:'link',attribute:'href',writeto:'mylinks',isPath:true},
          remove: '#removeMe',
          update: {selector:'html',attribute:'appmode',value:'production'},
          append: {selector:'body',html:'<div id="appended">Im being appended</div>'}, 
          prepend: {selector:'body',html:'<span>Im being prepended</span>'},
          text: {selector:'title',text:'CHANGED TITLE'},
          callback: function($){
            $('#sample2').text('Ive been updated via callback');
          }
        },
        src: 'test/fixtures/index.html',
        dest: 'tmp/index_cheerio.html'        
      }
    },
    concat: {
      test: {
        src:['test/fixtures/css0.css','<%= dom_munger.data.mylinks %>'],
        dest:'tmp/concated.css'
      }
    },
    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'dom_munger', 'concat', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
