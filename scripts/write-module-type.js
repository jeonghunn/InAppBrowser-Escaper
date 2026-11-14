const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const outputDirectory = process.argv[2];
writeFileSync(join(outputDirectory, 'package.json'), '{ "type": "module" }\n');
