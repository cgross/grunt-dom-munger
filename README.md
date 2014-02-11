# grunt-dom-munger [![Build Status](https://travis-ci.org/cgross/grunt-dom-munger.png?branch=master)](https://travis-ci.org/cgross/grunt-dom-munger)

> Read and manipulate HTML documents using CSS selectors.

Use this task to read and transform your HTML documents.  Typical use cases include:

* Read the references from your `script` or `link` tags and pass those to `concat`,`uglify`, etc automatically.
* Update HTML to remove script references or anything that is not intended for your production builds.
* Add, update, or remove any DOM elements for any reason.

## Getting Started
This plugin requires Grunt `~0.4.1` and Node `>=0.8`.

```shell
npm install grunt-dom-munger --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-dom-munger');
```

## The "dom_munger" task

### Overview
The dom-munger reads one or more HTML files and performs one or more operations on them.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        //You typically would only specify one option per target but they may be combined
        //options may also be arrays to specify multiple reads/removes/etc
        read: {selector:'link',attribute:'href',writeto:'myCssRefs',isPath:true},
        remove: '#removeMe',
        update: {selector:'html',attribute:'appmode', value:'production'},
        prefix: {selector:'link',attribute:'href',value:'project-name/'},
        suffix: {selector:'html',attribute:'version',value:'.0.1'},
        append: {selector:'body',html:'<div id="appended">Im being appended</div>'},
        prepend: {selector:'body',html:'<span>Im being prepended</span>'},
        text: {selector:'title',text:'My App'},
        callback: function($){
          $('#sample2').text('Ive been updated via callback');
        }
      },
      src: 'index.html', //could be an array of files
      dest: 'dist/index.html' //optional, if not specified the src file will be overwritten
    },
  },
})
```


### Options

Note: each option (except callback) requires a `selector`.  This can be any valid CSS selector.  Also, each option (except callback) can be a single object (or String for `remove`) or an array of objects/Strings.  In this way, one target may perform multiple actions of the same type.

#### options.read
Extract the value of a given attribute from the set of matched elements then set the values into `dom_munger.data.{writeto}`.  A typical use-case is to grab the script references from your html file and pass that to `concat`,`uglify`, or `cssmin`.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        read: {selector:'script',attribute:'src',writeto:'myJsRefs',isPath:true}
      },
      src: 'index.html'
    },
  },
  uglify: {
    dist: {
      src:['other.js','<%= dom_munger.data.myJsRefs %>'],
      dest: 'dist/app.min.js'
    }
  }
})
```

When `isPath` is true, the extracted values are assumed to be file references and their path is made relative to the Gruntfile.js rather than the file they're read from.  This is usually necessary when passing the values to another grunt task like `concat` or `uglify`.

#### options.remove
Removes one or more matched elements.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        remove: '#removeMe' //remove an element with the id of removeMe
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```
#### options.update
Updates the value of a given attribute for the set of matched elements.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        update: {selector:'html',attribute:'appmode', value:'production'}, //set a appmode="production" on <html>
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.prefix
Prepends to the value of a given attribute for the set of matched elements.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        prefix: {selector:'link',attribute:'href', value:'project-name/'}, //prepend project-name to the href attribute, for example href="project-name/next/path" on <link>
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.suffix
Appends to the value of a given attribute for the set of matched elements.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        suffix: {selector:'html',attribute:'version', value:'.0.1'}, //append .0.1 to the version attribute, for example version="1.0.1" on <html>
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.append
Appends the content to each matched element.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        append: {selector:'body',html:'<div id="appended">Im being appended</div>'}
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.prepend
Prepends the content to each matched element.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        prepend: {selector:'body',html:'<span>Im being prepended</span>'}
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.text
Updates the text content of the matched elements.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        text: {selector:'title',text:'My App'} //Updates the <title> to "My App"
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

#### options.callback
When you feel like bustin loose.  Set a callback function and use the passed JQuery object to do anything you want to the HTML.  The second argument to the callback is the name of the file being processed.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        callback: function($,file){
          //do anything you want here
        }
      },
      src: 'index.html',
      dest: 'dist/index.html'
    }
  }
})
```

### Quick Note About Ordering

When specifying multiple actions for a single task, the order of the actions is always:

* `read` actions
* `remove` actions
* all other actions

This ensures that you can use one task to read script or link tags, then remove them, then append tags containing the concatentated/minified references.

## Full End-to-End Example for Concatentation and Minification

The following is an example config to read your js and css references from html, concat and min them, and
update the html with the new combined files.

This configuration would be run in this order:

```shell
grunt dom_munger cssmin uglify
```

```js
grunt.initConfig({
  dom_munger: {
    read: {
      options: {
          read: [
            {selector:'link',attribute:'href',writeto:'cssRefs',isPath:true},
            {selector:'script',attribute:'src',writeto:'jsRefs',isPath:true}
          ],
          remove: ['link','script'],
          append: [
            {selector:'head',html:'<link href="css/app.full.min.css" rel="stylesheet">'},
            {selector:'body',html:'<script src="js/app.full.min.js"></script>'}
          ]
        }
      },
      src: 'index.html', //read from source index.html
      dest: 'dist/index.html'  //update the dist/index.html (the src index.html is copied there)
    },
  },
  cssmin: {
    main: {
      src:'<%= dom_munger.data.cssRefs %>', //use our read css references and concat+min them
      dest:'dist/css/app.full.min.css'
    }
  },
  uglify: {
    main: {
      src: '<%= dom_munger.data.jsRefs %>', //use our read js references and concat+min them
      dest:'dist/js/app.full.min.js'
    }
  }
});
```

## Release History
 * v3.4.0 - Update task actions ordering.  Reads always first, removes second, all others after.
 * v3.3.0 - All task actions can now be arrays for multiple actions per type.
 * v3.2.0 - Added second `file` argument to callback (#15).
 * v3.1.0 - Prefix and suffix options added.  Fixes for issues #8, #10, and #11.
 * v3.0.0 - Removed `jsdom` engine as `cheerio` is as good without needing contextify.
 * v2.0.0 - Moved to `cheerio` engine.  Upgraded jquery to v2.
 * v1.0.1 - `remove` moved to the second to last operation performed (only `callback` is later).
 * v1.0.0 - Read task modified to write values to `dom_munger.data` rather than to write directly to a task config.
 * v0.1.0 - Initial release.
