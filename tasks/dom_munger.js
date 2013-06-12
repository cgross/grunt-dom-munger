/*
 * grunt-dom-munger
 * https://github.com/cgross/grunt-dom-munger
 *
 * Copyright (c) 2013 Chris Gross
 * Licensed under the MIT license.
 */
'use strict';

var jsdom; //only init-ed when needed = require("jsdom");
var path = require('path');
var fs = require('fs');
var cheerio;// only init-ed when needed = require('cheerio');

module.exports = function(grunt) {

  var jqueryContents;

  var processFile = function(f,dest,options,$,window){

    grunt.log.subhead('Processing ' + f.cyan);

    var updated = false;

    if (options.read){
      if (!options.read.selector || !options.read.attribute || !options.read.writeto){
        grunt.log.error('Read config missing selector, attribute, and/or writeto options');
      } else {

        var vals = $(options.read.selector).map(function(i,elem){
          return $(elem).attr(options.read.attribute);
        });

        if (options.engine === 'jsdom'){
          vals = vals.toArray();
        }

        if (options.read.isPath){
          var relativeTo = path.dirname(grunt.file.expand(f));
          vals = vals.map(function(val){
            return path.join(relativeTo,val);
          });
        }

        grunt.config(['dom_munger','data',options.read.writeto],vals);
        grunt.log.writeln('Wrote ' + (options.read.selector + '.' + options.read.attribute).cyan + ' to ' + ('dom_munger.data.'+options.read.writeto).cyan);
      }
    }

    if (options.update){
      if (!options.update.selector || !options.update.attribute || !options.update.value){
        grunt.log.error('Update config missing selector, attribute, and/or value options');
      } else {
        $(options.update.selector).attr(options.update.attribute,options.update.value);
        grunt.log.writeln('Updated ' + options.update.attribute.cyan + ' to ' + options.update.value.cyan);
        updated = true;
      }
    }

    if (options.append){
      if (!options.append.selector || !options.append.html){
        grunt.log.error('Append config missing selector and/or html options');
      } else {
        $(options.append.selector).append(options.append.html);
        grunt.log.writeln("Appended to " + options.append.selector.cyan);
        updated = true;
      }
    }

    if (options.prepend){
      if (!options.prepend.selector || !options.prepend.html){
        grunt.log.error('Prepend config missing selector and/or html options');
      } else {
        $(options.prepend.selector).prepend(options.prepend.html);
        grunt.log.writeln("Prepended to " + options.prepend.selector.cyan);
        updated = true;
      }
    }

    if (options.text){
      if (!options.text.selector || !options.text.text){
        grunt.log.error('Text config missing selector and/or text options');
      } else {
        $(options.text.selector).text(options.text.text);
        grunt.log.writeln('Applied text to ' + options.text.selector.cyan);
        updated = true;
      }
    }

    if (options.remove){
      $(options.remove).remove();
      grunt.log.writeln('Removed ' + options.remove.cyan);
      updated = true;
    }            

    if (options.callback){
       options.callback($);
       //just assume its updating something
       updated = true;
    }

    if (updated){
      var updatedContents;
      if (options.engine === 'cheerio'){
        updatedContents = $.html()
      } else {
        updatedContents = window.document.doctype.toString()+window.document.innerHTML;
      }
      grunt.file.write(dest || f,updatedContents);
      grunt.log.writeln('File ' + (dest || f).cyan + ' created/updated.');    
    }      

  };

  grunt.registerMultiTask('dom_munger', 'Read and manipulate html.', function() {

    var options = this.options({
      engine:'cheerio'
    });
    var done = this.async();
    var countdown = 0;

    if (this.filesSrc.length > 1 && this.data.dest){
      grunt.log.error('Dest cannot be specified with multiple src files.');
      done(false);      
    }

    if (['jsdom','cheerio'].indexOf(options.engine) === -1){
      grunt.log.error('Engine options must be either jsdom or cheerio.');
      done(false);      
    }    

    this.files.forEach(function(f) {

      var dest = f.dest;

      f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function(f){

        countdown++;

        var srcContents = grunt.file.read(f);

        if (options.engine === 'cheerio'){

          if (!cheerio){
            cheerio = require('cheerio');
          }

          var $ = cheerio.load(srcContents);
          processFile(f,dest,options,$);

          countdown --;
          if (countdown === 0){
            done();
          }          

        } else {

          if (!jsdom){
            jsdom = require('jsdom');
            jqueryContents = fs.readFileSync(path.join(__dirname,'../vendor/jquery-2.0.2.min.js'));
          }

          jsdom.env({
            html: srcContents,
            src: [jqueryContents],
            done: function process(errors,window){

              processFile(f,dest,options,window.$,window);

              countdown --;
              if (countdown === 0){
                done();
              }              

            }
          });  
        }

      });
    });

  });

};
