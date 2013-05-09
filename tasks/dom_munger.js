/*
 * grunt-dom-munger
 * https://github.com/cgross/grunt-dom-munger
 *
 * Copyright (c) 2013 Chris Gross
 * Licensed under the MIT license.
 */
'use strict';

var jsdom = require("jsdom");
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

  var jqueryContents = fs.readFileSync(path.join(__dirname,'../vendor/jquery-1.9.1.min.js'));

  grunt.registerMultiTask('dom_munger', 'Read and manipulate html.', function() {

    var options = this.options({
    });
    var done = this.async();
    var countdown = 0;

    if (this.filesSrc.length > 1 && this.data.dest){
      grunt.log.error('Dest cannot be specified with multiple src files.');
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

        jsdom.env({
          html: srcContents,
          src: [jqueryContents],
          done: function process(errors,window){

            grunt.log.subhead('Processing ' + f.cyan);

            var $ = window.$;
            var updated = false;

            if (options.read){
              if (!options.read.selector || !options.read.attribute || !options.read.writeto){
                grunt.log.error('Read config missing selector, attribute, and/or writeto options');
              } else {
                if(!options.read.filter) {
                  options.read.filter = function(val) {return val;};
                }
                var vals = $.map($(options.read.selector),function(elem){
                  return options.read.filter($(elem).attr(options.read.attribute));
                });

                if (options.read.isPath){
                  var relativeTo = path.dirname(grunt.file.expand(f));
                  vals = $.map(vals,function(val){
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
              var updatedContents = window.document.doctype.toString()+window.document.innerHTML;
              grunt.file.write(dest || f,updatedContents);
              grunt.log.writeln('File ' + (dest || f).cyan + ' created/updated.');    
            }        

            countdown --;
            if (countdown === 0){
              done();
            }
          }
        });         
      });
    });
  });

};
