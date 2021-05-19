var spinner = require('./spinner');
var { program } = require('commander');
var fs = require('fs').promises;
var tasks = [];
program.version('1.0');

fs
 .readdir(__dirname + '/tasks')
 .then(files =>
  files
   .filter(f => f.indexOf('.js') >= 0)
   .map(file => require('./tasks/' + file))
   .forEach(module => {
    tasks.push(module);
    process.on('SIGINT', () => module.termination());
   })
 )
 .then(() => {
  process.on('SIGINT', process.exit);
  program.parse(process.argv);
 });

/*program
  .command("exec <cmd>")
  .alias("ex")
  .description("execute the given remote cmd")
  .option("-e, --exec_mode <mode>", "Which exec mode to use")
  .action(function (cmd, options) {

    var s = spinner('Creating repository for project.')
    setTimeout(() => {
        s.succeed('Successful created the repository for the project.')
    }, 3000);
  })
  .on("--help", function () {
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  $ deploy exec sequential");
    console.log("  $ deploy exec async");
  });*/
