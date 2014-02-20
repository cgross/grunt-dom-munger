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

var toArray = function(value) {
  return (Array.isArray(value)) ? value : [value];
}

module.exports = function(grunt) {

  var processFile = function(f,dest,options,$,window){

    grunt.log.subhead('Processing ' + f.cyan);

    var updated = false;

    if (options.read){
      options.read = toArray(options.read);
      options.read.forEach(function(option) {
        if (!option.selector || !option.attribute || !option.writeto){
          grunt.log.error('Read config missing selector, attribute, and/or writeto options');
        } else {

          var vals = $(option.selector).map(function(i,elem){
            return $(elem).attr(option.attribute);
          });

          if (option.isPath){
            option.isPath = path.dirname(grunt.file.expand(f));
          }

          if (option.callback) {
            var newVals = [];
            vals.forEach(function(item){
              item = option.callback(item);
              if (item) {
                if (option.isPath)
                  item = path.join(relativeTo,item);
                newVals.push(item);
              }
            });
            vals = newVals;
          } else {
            vals = vals.filter(function(item){
              return item !== undefined;
            });
          }


          grunt.config(['dom_munger','data',option.writeto],vals);
          grunt.log.writeln('Wrote ' + (option.selector + '.' + option.attribute).cyan + ' to ' + ('dom_munger.data.'+option.writeto).cyan);
        }

      });
    }

    if (options.prefix){
      options.prefix = toArray(options.prefix);
      options.prefix.forEach(function(option) {
        if (!option.selector || !option.attribute || !option.value){
          grunt.log.error('Prefix config missing selector, attribute, and/or value options');
        } else {
          $(option.selector).each(function () {
             $(this).attr(option.attribute, option.value + $(this).attr(option.attribute));
          });
          grunt.log.writeln('Prefixed ' + option.attribute.cyan + ' with ' + option.value.cyan);
          updated = true;
        }
      });
    }

    if (options.suffix){
      options.suffix = toArray(options.suffix);
      options.suffix.forEach(function(option) {
        if (!option.selector || !option.attribute || !option.value){
          grunt.log.error('Suffix config missing selector, attribute, and/or value options');
        } else {
          $(option.selector).each(function () {
             $(this).attr(option.attribute, $(this).attr(option.attribute) + option.value);
          });
          grunt.log.writeln('Suffixed ' + option.attribute.cyan + ' with ' + option.value.cyan);
          updated = true;
        }
      });
    }

    if (options.text){
      options.text = toArray(options.text);
      options.text.forEach(function(option) {
        if (!option.selector || !option.text){
          grunt.log.error('Text config missing selector and/or text options');
        } else {
          $(option.selector).text(option.text);
          grunt.log.writeln('Applied text to ' + option.selector.cyan);
          updated = true;
        }
      });
    }

    if (options.update){
      options.update = toArray(options.update);
      options.update.forEach(function(option) {
        if (!option.selector || !option.attribute || !option.value){
          grunt.log.error('Update config missing selector, attribute, and/or value options');
        } else {
          $(option.selector).attr(option.attribute,option.value);
          grunt.log.writeln('Updated ' + option.attribute.cyan + ' to ' + option.value.cyan);
          updated = true;
        }
      });
    }

    ['prepend', 'append', 'before', 'after', 'replace'].forEach(function(method){
      if (options[method]) {
        options[method] = toArray(options[method]);
        options[method].forEach(function(option){
          if (!option.selector || !option.html){
            grunt.log.error('Config for "'+method+'" missing selector and/or html options');
          } else {
            $(option.selector)[method](option.html);
            grunt.log.writeln("Performed '"+method+"' to " + option.selector.cyan);
            updated = true;
          }
        });
      }
    });

    if (options.remove){
      options.remove = toArray(options.remove);
      options.remove.forEach(function(option) {
        $(option).remove();
        grunt.log.writeln('Removed ' + option.cyan);
        updated = true;
      });
    }

    if (options.callback){
       options.callback($, f);
       //just assume its updating something
       updated = true;
    }

    if (updated){
      var updatedContents = options.xml ? $.xml() : $.html();
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

        var $ = cheerio.load(srcContents,{lowerCaseAttributeNames:false, xmlMode:options.xml ? true : false});
        processFile(f,dest,options,$);

      });
    });

    done();
  });

};
