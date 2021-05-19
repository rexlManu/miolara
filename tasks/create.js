const { program } = require('commander');
var shell = require('shelljs');
var createSpinner = require('../spinner');
var logger = require('../logger');
var fs = require('fs').promises;
var path = require('path');
var utils = require('../utils');
const GithubClient = require('../lib/github/github-client');
var credentials = require('../credentials');
var github = new GithubClient(credentials.githubToken);
var os = require('os');

var execution = (name, options) => {
 if (!shell.which('git')) {
  return logger.error('You must have git installed to use this command.');
 }
 if (!shell.which('laravel')) {
  return logger.error('You must have laravel installer to use this command.');
 }
 fs
  .stat(path.join(process.cwd(), 'test'))
  .then(details => {
   logger.error(
    `Directory ${name} already exists, please choose a other name.`
   );
  })
  .catch(async () => {
   if (options.cache) {
    var spinner = createSpinner('Copying cached version');
    fs.mkdir(path.join(process.cwd(), name));
    await utils.copyDir(
     path.join(os.tmpdir(), 'miolara', 'framework'),
     path.join(process.cwd(), name)
    );
    var environmentFile = path.join(process.cwd(), name, '.env');
    await fs.copyFile(
     path.join(process.cwd(), name, '.env.example'),
     environmentFile
    );
    fs.writeFile(
     environmentFile,
     (await fs.readFile(environmentFile, 'utf-8'))
      .replace('Laravel', name)
      .replace('laravel', name.toLowerCase())
    );
    spinner.succeed('Files copied to folder.');
   } else {
    await utils.executeCommand(
     `laravel new ${name} -q -n`,
     //`cd ${name} && composer install -q`, // just for debug bcs shorter command
     'Creating laravel project',
     'Laravel project successful created!',
     'Could not create the laravel project.'
    );
   }
   await utils.executeCommand(
    `cd ${name} && php artisan key:generate`,
    'Generating app key',
    'App key successful generated.',
    'Failed to generate app key'
   );

   if (options.git) {
    var spinner = createSpinner('Creating github repository');
    github
     .post(options.team ? `/orgs/${options.team}/repos` : 'user/repos', {
      name,
      description: `Laravel project created by miolara.`,
      private: !options.public,
     })
     .then(async repo => {
      spinner.succeed(`Repository ${repo.full_name} created.`);
      await utils.executeCommand(
       `cd ${name} && git init -b ${
        options.branch ?? 'master'
       } && git remote add origin ${
        repo.ssh_url
       } && git add -A && git commit -m "Initial commit"`,
       'Preparing local repository',
       'Fully prepared local repository for pushing',
       'Failed to prepare local repository.'
      );

      await utils.executeCommand(
       `cd ${name} && git push -u origin ${options.branch ?? 'master'}`,
       `Pushing to ${repo.full_name}`,
       'Successful pushed to remote repository.',
       'Failed to push to remote repository.'
      );
     })
     .catch(err => {
      spinner.fail(err);
     });
   }
  });
};

var termination = () => {};

program
 .command('create <name>')
 .description('Creates a laravel projects')
 .option('-g, --git', 'Directly creates a git repository and pushes the code')
 .option('--public', 'Show the git repository as public')
 .option('-t, --team <team>', 'Use a team for the git repository')
 .option('-b, --branch <branch>', 'Use a custom branch instead of master')
 .option(
  '-c, --cache',
  'Use a cached version of laravel instead fresh downloaded version'
 )
 .action(execution);

module.exports = {
 execution,
 termination,
};
