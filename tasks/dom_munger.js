/*
 * grunt-dom-munger
 * https://github.com/cgross/grunt-dom-munger
 *
 * Copyright (c) 2013 Chris Gross
 * Licensed under the MIT license.
 */
'use strict';

var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');

module.exports = function(grunt) {

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

        vals = vals.filter(function(item){
          return item !== undefined;
        });

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

    if (options.prefix){
      if (!options.prefix.selector || !options.prefix.attribute || !options.prefix.value){
        grunt.log.error('Prefix config missing selector, attribute, and/or value options');
      } else {
        $(options.prefix.selector).each(function () {
           $(this).attr(options.prefix.attribute, options.prefix.value + $(this).attr(options.prefix.attribute));
        });
        grunt.log.writeln('Prefixed ' + options.prefix.attribute.cyan + ' with ' + options.prefix.value.cyan);
        updated = true;
      }
    }

    if (options.suffix){
      if (!options.suffix.selector || !options.suffix.attribute || !options.suffix.value){
        grunt.log.error('Suffix config missing selector, attribute, and/or value options');
      } else {
        $(options.suffix.selector).each(function () {
           $(this).attr(options.suffix.attribute, $(this).attr(options.suffix.attribute) + options.suffix.value);
        });
        grunt.log.writeln('Suffixed ' + options.suffix.attribute.cyan + ' with ' + options.suffix.value.cyan);
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
      var updatedContents = $.html()
      grunt.file.write(dest || f,updatedContents);
      grunt.log.writeln('File ' + (dest || f).cyan + ' created/updated.');    
    }      

  };

  grunt.registerMultiTask('dom_munger', 'Read and manipulate html.', function() {

    var options = this.options({});
    var done = this.async();

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

        var srcContents = grunt.file.read(f);

        var $ = cheerio.load(srcContents,{lowerCaseAttributeNames:false});
        processFile(f,dest,options,$);

      });
    });

    done();
  });

};
