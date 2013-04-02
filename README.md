# grunt-dom-munger

> Read and manipulate HTML documents with jsdom and jquery.

Use this task to read and transform your HTML documents.  Typical use cases include:

* Read the references from your `script` or `link` tags and have those passed to `concat`,`uglify`, etc automatically.
* Update HTML to remove script references or anything that is not intended for your production builds.
* Add, update, or remove any DOM elements for any reason.

## Getting Started
This plugin requires Grunt `~0.4.1`

```shell
npm install grunt-dom-munger --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

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
        read: {selector:'link',attribute:'href',task:'concat',target:'dist/concated.css',isPath:true},
        remove: '#removeMe',
        update: {selector:'html',attribute:'appmode',value:'production'},
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

Note: each option (except callback) requires a `selector`.  This can be any valid JQuery selector.

#### options.read 
Extract the value of a given attribute from the set of matched elements then set the values into a grunt config of another task.  A typical use-case is to grab the script references from your html file and pass that to `concat`.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        read: {selector:'script',attribute:'src',task:'uglify',target:'dist/app_full_min.js',isPath:true}
      },
      src: 'index.html'
    },
  },
})
```

Run `uglify` after this task and `uglify` will create `dist/app_full_min.js` using the references from your script.  No need to have any `uglify` config in your Gruntfile.js beforehand.

`task` and `target` are where you want the extracted values to be written.  When `isPath` is true, the extracted values are assumed to be file references and their path is made relative to the file they're read from.  This is usually necessary when writing the values to another grunt task like `concat` or `uglify`.

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
        update: {selector:'html',attribute:'appmode',value:'production'} //set a appmode="production" on <html>
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
When you feel like bustin loose.  Set a callback function and use the passed JQuery object to do anything you want to the HTML.

```js
grunt.initConfig({
  dom_munger: {
    your_target: {
      options: {
        callback: function($){
          //do anything you want here
        }
      },
      src: 'index.html',
      dest: 'dist/index.html'
    },
  },
})
```

## Release History

 * v0.1.0 - Initial release.
