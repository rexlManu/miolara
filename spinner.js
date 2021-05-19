var ora = require('ora');
var spinners = [];

var create = text => {
 var spinner = ora({ color: 'blue' }).start(text);
 spinners.push(spinner);
 return spinner;
};

process.on('SIGINT', () =>
 spinners
  .filter(s => s.isSpinning)
  .forEach(spinner => spinner.fail('Task was cancelled by user!'))
);

module.exports = create;
