'use strict';

var spawn = require('child_process').spawn;
var Bacon = require('sigh-core').Bacon;
var log = require('sigh-core').log;
var treeKill = require('tree-kill');

module.exports = function(op, cmd) {
    var proc = null;
    if (!op.watch) {
        return op.stream;
    }
    var splitCmd = cmd.split(' ');

    var kill = function(proc) {
        if (!proc) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            treeKill(proc.pid, 'SIGKILL', function(err) {
                (err) ? reject(err) : resolve();
            });
        });
    };

    var spawnProcess = function(resolve, reject) {
        log('spawn process `%s`', cmd);
        kill(proc).then(function() {
            proc = spawn(splitCmd[0], splitCmd.slice(1), {
                stdio: [process.stdin, 'pipe', process.stderr]
            });
            proc.stdout.pipe(process.stdout);
            proc.stdout.on('data', function(line) {
                if (resolve) {
                    resolve();
                    resolve = null;
                }
            });
        });
    };

    return op.stream.flatMap(function(events) {
        return Bacon.fromPromise(new Promise(spawnProcess).then(function() {
            return events;
        }));
    });
};