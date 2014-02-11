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
          read: {selector:'link',attribute:'href',writeto:'mylinks',isPath:true},
          remove: '#removeMe',
          update: {selector:'html',attribute:'appmode',value:'production'},
          prefix: {selector:'link',attribute:'href',value:'project-name/'},
          suffix: {selector:'html',attribute:'version',value:'.0.1'},
          append: {selector:'body',html:'<div id="appended">Im being appended</div>'},
          prepend: {selector:'body',html:'<span>Im being prepended</span>'},
          text: {selector:'title',text:'CHANGED TITLE'},
          callback: function($, file){
            $('#sample2').text('Ive been updated via callback');
            $('#filepath').text('Made from ' + file);
          }
        },
        src: 'test/fixtures/index.html',
        dest: 'tmp/index.html'
      },
      test2: {
        options: {
          read: {selector:'script',attribute:'src',writeto:'test',isPath:true}
        },
        src: 'test/fixtures/index.html'
      },
      test3: {
        options: {
          read: [
            {selector:'link',attribute:'href',writeto:'mylinks',isPath:true},
            {selector:'script[src]',attribute:'src',writeto:'myscripts',isPath:true}
          ],
          remove: ['#removeMe'],
          update: [{selector:'html',attribute:'appmode',value:'production'}],
          prefix: [{selector:'link',attribute:'href',value:'project-name/'}],
          suffix: [{selector:'html',attribute:'version',value:'.0.1'}],
          append: [{selector:'body',html:'<div id="appended">Im being appended</div>'}],
          prepend: [{selector:'body',html:'<span>Im being prepended</span>'}],
          text: [
            {selector:'title',text:'CHANGED TITLE'},
            {selector:'#sample2',text:'Ive been updated via callback'},
            {selector:'#filepath',text:'Made from test/fixtures/index.html'}
          ],
        },
        src: 'test/fixtures/index.html',
        dest: 'tmp/index.html'
      },
      test_order: { //order should be read then remove then any other update operations
        options: {
          read: [
            {selector:'link',attribute:'href',writeto:'links_order',isPath:true},
            {selector:'script',attribute:'src',writeto:'scripts_order',isPath:true}
          ],
          remove: ['script','link'],
          append: [
            {selector:'head',html:'<link href="concat.css">'},
            {selector:'body',html:'<script src="concat.js">'}
          ]
        },
        src: 'test/fixtures/order.html',
        dest: 'tmp/order.html'
      }
    },
    write_src: {
      test: {
        src: ['<%= dom_munger.data.links_order %>','<%= dom_munger.data.scripts_order %>']
      }
    },
    concat: {
      test: {
        src:['test/fixtures/css0.css','<%= dom_munger.data.mylinks %>'],
        dest:'tmp/concated.css'
      },
      test3: {
        src:['<%= dom_munger.data.myscripts %>'],
        dest:'tmp/concated.js'
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

  grunt.registerMultiTask('write_src', 'Testing task.  Writes src files to file.', function() {
    var fs = require('fs');
    fs.writeFileSync('tmp/read_order.txt',JSON.stringify(this.filesSrc));
  });

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'dom_munger', 'write_src', 'concat', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
