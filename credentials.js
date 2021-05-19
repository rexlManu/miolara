var os = require('os');
var fs = require('fs');
var path = require('path');

const CREDENTIALS_PATH = '.miolara/credentials.json';


if(!fs.existsSync(path.join(os.homedir(), CREDENTIALS_PATH))) {
    fs.writeFileSync(path.join(os.homedir(), CREDENTIALS_PATH), JSON.stringify({}));
}

module.exports = JSON.parse(fs.readFileSync(path.join(os.homedir(), CREDENTIALS_PATH), 'utf-8'));
