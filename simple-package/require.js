const configFilePath = process.env.CONFIG_FILE;
if (!configFilePath) {
	throw new Error(`please set environment "CONFIG_FILE".`);
}

console.log(`load config from ${configFilePath}`);
if (!require('fs').existsSync(configFilePath)) {
	throw new Error(`config file ${configFilePath} not exists.`);
}
module.exports = require(configFilePath);
