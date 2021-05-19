#!/usr/bin/env node
try {
 new Function('var {a} = {a: 1}')();
} catch (error) {
 console.error(
  'Your JavaScript runtime does not support some features used by the miolara command. Please use Node 8 or later.'
 );
 process.exit(1);
}

require('../index');
