var chalk = require('chalk');
var levels = [
 {
  name: 'info',
  color: chalk.green,
  alias: [],
  icon: '👍',
 },
 {
  name: 'warning',
  color: chalk.yellow,
  alias: ['warn'],
  icon: '⚠️',
 },
 {
  name: 'error',
  color: chalk.red,
  alias: ['fail'],
  icon: '🦠',
 },
];

var logMessage = (level, message, params) =>
 console.log(
  `${level.color('[')} ${level.icon} ${level.color(']')} ${message}`,
  params ?? ''
 );

var logger = {};
var addLogger = (level, name) =>
 (logger[name ?? level.name] = (message, params) =>
  logMessage(level, message, params));
levels.forEach(level => {
 level.alias.forEach(alias => addLogger(level, alias));
 addLogger(level);
});

module.exports = logger;
