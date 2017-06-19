const debug = require('debug')('jenv:loader');
let data, cache;

function loader() {
	const configFilePath = process.env.CONFIG_FILE || process.env.JENV_FILE_NAME;
	if (!configFilePath) {
		throw new Error(`please set environment "CONFIG_FILE" or "JENV_FILE_NAME".`);
	}
	
	if (cache === configFilePath) {
		return data;
	}
	
	debug(`load config from ${configFilePath}`);
	if (!require('fs').existsSync(configFilePath)) {
		throw new Error(`config file ${configFilePath} not exists.`);
	}
	
	cache = configFilePath;
	return data = require(configFilePath);
}

module.exports = loader;
module.exports.load = loader;
Object.defineProperty(module.exports, 'JsonEnv', {
	get: loader,
	configurable: false,
	enumerable: true,
});

Object.defineProperty(exports, "__esModule", { value: true });
