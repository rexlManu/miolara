const { program } = require('commander');
var shell = require('shelljs');
var createSpinner = require('../spinner');
var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var os = require('os');
const logger = require('../logger');
const chalk = require('chalk');
const FRAMEWORK_PATH = path.join(os.tmpdir(), 'miolara', 'framework');
var execution = async options => {
 if (options.cachedVersion) {
  logger.info(
   `Currently cached version: ${chalk.green(
    shell.exec(`cd ${FRAMEWORK_PATH} && php artisan -V`, { silent: true })
     .stdout
   )}`
  );
  return;
 }

 if (!fs.existsSync(path.join(os.tmpdir(), 'miolara'))) {
  fs.mkdirSync(path.join(os.tmpdir(), 'miolara'));
 }

 if (fs.existsSync(FRAMEWORK_PATH)) {
  await utils.executeCommand(
   `cd ${FRAMEWORK_PATH} && composer update -q -n`,
   'Updating the framework',
   'Updated the framework',
   'Failed to update the framework'
  );
 } else {
  await utils.executeCommand(
   `cd ${os.tmpdir()}\\miolara && laravel new framework -q -n`,
   'Downloading laravel framework',
   'Successful downloaded the laravel framework',
   'Failed to download the framework'
  );
 }
 if (fs.existsSync(path.join(FRAMEWORK_PATH, '.env'))) {
  fs.unlinkSync(path.join(FRAMEWORK_PATH, '.env'));
 }
};

var termination = () => {};

program
 .command('cache')
 .description('Downloads and caches the laravel framework')
 .option('-c, --cached-version', 'Show version of the cached project')
 .action(execution);

module.exports = {
 execution,
 termination,
};
