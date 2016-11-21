# sigh-proc
sigh plugin for running processes (e.g. express server)

This plugin is designed to run processes that run indefinitely. The first time the plugin instance receives an event it starts the configured process, on subsequent events it kills the running process and starts another. It forwards all input events but delays them until the process has output at least one line to standard output. In `watch` mode the plugin is a no-op.

## Why?
[sigh-process](https://github.com/sighjs/sigh-process) uses `proc.kill()` to kill process
but it does not kill process immediately. On OS Windows sometimes error happens `EADDRINUSE`.
This module uses [tree-kill](https://www.npmjs.com/package/tree-kill) module to kill process.

## Example

`npm install --save-dev sigh-proc` then add something like this to your `sigh.js`:
```javascript
var proc;

module.exports = function(pipelines) {
  pipelines.run = [ proc('node server.js') ]
}
```

This would run the process whenever a source file is compiled:
```javascript
var glob, babel, write, proc;

module.exports = function(pipelines) {
  pipelines.build = [
    glob({ basePath: 'src' }, '**/*.js'),
    babel(),
    write('lib'),
    proc('node lib/server.js'),
  ]
}
```