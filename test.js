//var spawn = require('child-process-promise').spawn;

var childProcess = require('child_process');

console.log('LETS GO');
var result = childProcess.spawn('php', ['rene/artisan', 'serve'], {
    stdio: ['inherit']
});

console.log('HELP');
var stdout = result.stdout;
var stderr = result.stderr;
result.stdout.on('data',data => {
    console.log(data.toString())
})
//console.log('stdout: ', stdout);
//console.log('stderr: ', stderr);

result.on('kill', () => {
 console.log('KILLED');
});
setTimeout(() => {
 console.log('KILLING');
 result.kill();
 childProcess.exec('taskkill /F /pid '+result.pid);
 console.log(result.killed);
}, 1000);

console.log('UFF');
