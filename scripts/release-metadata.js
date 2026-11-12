const { appendFileSync } = require('node:fs');
const { name, version } = require('../package.json');

const expectedTag = `v${version}`;
if (process.env.GITHUB_REF_NAME !== expectedTag) {
  throw new Error(`Release tag must be ${expectedTag} for ${name}@${version}`);
}

appendFileSync(process.env.GITHUB_OUTPUT, `name=${name}\nversion=${version}\n`);
