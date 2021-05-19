const { program } = require('commander');

var utils = require('../utils');
var shell = require('shelljs');
var execa = require('execa');
var charm = require('charm')();
var readline = require('readline');
const logger = require('../logger');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

charm.pipe(process.stdout);
charm.reset();

const Status = [
 {
  icon: '❌',
 },
 {
  icon: '⚙️',
 },
 {
  icon: '✅',
 },
];

class Menu {
 constructor() {
  this.elements = [];
  charm.position(0, 0);

  process.stdin.on('keypress', (str, key) => {
   if (key.name == 'c' && key.ctrl) {
    charm.reset();
    process.exit();
    return;
   }
   var keyName = key.name;
   var element = this.elements.filter(e => e.active)[0];

   switch (keyName) {
    case 'up':
    case 'down':
     var index = this.elements.indexOf(element);
     element.active = false;
     index += keyName == 'up' ? -1 : 1;
     if (index < 0) {
      index = 0;
     }
     if (index >= this.elements.length) {
      index = this.elements.length - 1;
     }
     this.elements[index].active = true;
     this.draw();
     break;
    case 'return':
     element.select();
     this.draw();
     break;
   }
  });
 }

 draw() {
  this.elements.forEach(e => e.draw());
  charm.position(500, 500);
 }
}

class Element {
 constructor(text, x, y, callback) {
  this.text = text;
  this.x = x;
  this.y = y;
  this.callback = callback;
  this.active = false;
 }

 draw() {
  charm.position(this.x, this.y);
  charm.foreground(this.active ? 'cyan' : 'white');
  charm.write(this.text);
 }

 select() {
  this.callback();
 }

 update() {
  this.draw();
  charm.position(500, 500);
 }
}

class ServiceElement extends Element {
 constructor(text, x, y) {
  super(text, x, y);
  this.status = 0;
 }

 draw() {
  charm.position(this.x, this.y);
  charm.foreground('white');
  charm.write(`[ ${Status[this.status].icon} ] `);
  charm.foreground(this.active ? 'cyan' : 'white');
  charm.write(this.text);
 }

 select() {}
}

class ServeElement extends ServiceElement {
 constructor(x, y) {
  super('Serve', x, y);

  this.process = null;
  this.url = null;
 }

 select() {
  if (this.status == 0) {
   /*this.process = shell.exec(`php artisan serve`, {
    async: true,
    silent: true,
   });
   this.process.stdout.on('data', data => {
    if (data.indexOf('started') != -1) {
     this.status = 2;
     this.url = data.split('(')[1].split(')')[0];
     this.update();
    }
   });
   this.process.on('exit', () => {
    this.status = 0;
    this.url = null;
    this.update();
   });
   this.status = 1;*/

   execa('php artisan serve').then(subprocess => {
    this.process = subprocess;
    subprocess.stdout.on('data', data => {
     if (data.indexOf('started') != -1) {
      this.status = 2;
      this.url = data.split('(')[1].split(')')[0];
      this.update();
     }
    });
   });
  }
  if (this.status == 2) {
   this.process.kill('SIGTERM', {
    forceKillAfterTimeout: 2000,
   });
   /*this.process.kill();
   this.status = 0;
   this.url = null;*/
  }
 }

 draw() {
  charm.position(this.x, this.y);
  charm.foreground('white');
  charm.write(`[ ${Status[this.status].icon} ] `);
  charm.foreground(this.active ? 'cyan' : 'white');
  charm.write(this.text);
  charm.foreground('white');
  if (this.url) {
   charm.move(15, 0);
   charm.write(`» ${this.url}`);
  } else {
   charm.move(15, 0);
   charm.write(`                                 `);
  }
 }
}

class QueueElement extends ServiceElement {
 constructor(x, y) {
  super('Queue', x, y);

  this.process = null;
  this.failedJobs = 0;
  this.successfulJobs = 0;
 }

 select() {
  if (this.status == 0) {
   this.process = shell.exec(`php artisan queue:listen`, {
    async: true,
    silent: true,
   });
   this.process.stdout.on('data', data => {
    if (data.indexOf('Processed') != -1) {
     this.successfulJobs++;
    }

    if (data.indexOf('Failed') != -1) {
     this.failedJobs++;
    }
    this.update();
   });
   this.process.on('exit', code => {
    this.status = 0;
    this.successfulJobs = 0;
    this.failedJobs = 0;
    this.update();
   });
   this.status = 2;
   return;
  }
  if (this.status == 2) {
   this.process.kill('SIGINT');
   this.status == 1;
  }
 }
 draw() {
  charm.position(this.x, this.y);
  charm.foreground('white');
  charm.write(`[ ${Status[this.status].icon} ] `);
  charm.foreground(this.active ? 'cyan' : 'white');
  charm.write(this.text);
  charm.foreground('white');
  if (this.status == 2) {
   charm.move(15, 0);
   charm.write(`» ${this.successfulJobs + this.failedJobs} Jobs - `);
   charm.foreground('green');
   charm.write(`${this.successfulJobs} `);
   charm.foreground('white');
   charm.write('/ ');
   charm.foreground('red');
   charm.write(`${this.failedJobs}`);
  } else {
   charm.move(15, 0);
   charm.write(`                                  `);
  }
 }
}

var execution = () => {
 if (shell.exec('php artisan -V', { silent: true }).code != 0) {
  return logger.error('Please enter a laravel project.');
 }

 var menu = new Menu();
 [
  new QueueElement(8, 2),
  new ServiceElement('Tasks', 8, 4),
  new ServeElement(8, 6),
  new ServiceElement('Assets Watch', 8, 8),
  new Element('Exit', 15, 10, () => {
   charm.reset();
   process.exit();
  }),
 ].forEach(e => menu.elements.push(e));

 menu.elements[0].active = true;
 menu.draw();
};

var termination = () => {};

program
 .command('serve')
 .description('Serves the laravel application')
 .action(execution);

module.exports = {
 execution,
 termination,
};
