var createSpinner = require('./spinner');
var shell = require('shelljs');
var activeProcesses = [];
var fs = require('fs').promises;
var path = require('path');
process.on('SIGINT', () => {
 activeProcesses.forEach(p => p.kill());
});
var self = {
 checkProcess: process =>
  new Promise((resolve, reject) => {
   activeProcesses.push(process);
   process.on('exit', code => {
    activeProcesses = activeProcesses.filter(p => p != process);
    if (code == 0) {
     resolve(code);
    } else {
     reject(code);
    }
   });
  }),
 createProcess: (command, options) => {
  return self.checkProcess(
   shell.exec(
    command,
    options ?? {
     async: true,
     silent: true
    }
   )
  );
 },
 executeCommand: (command, startMessage, successMessage, failMessage) =>
  new Promise(resolve => {
   var spinner = createSpinner(startMessage);
   self
    .createProcess(command)
    .then(() => resolve(spinner.succeed(successMessage)))
    .catch(() => spinner.fail(failMessage));
  }),
 copyDir: async (src, dest) => {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
   let srcPath = path.join(src, entry.name);
   let destPath = path.join(dest, entry.name);

   entry.isDirectory()
    ? await self.copyDir(srcPath, destPath)
    : await fs.copyFile(srcPath, destPath);
  }
 },
};

module.exports = self;
