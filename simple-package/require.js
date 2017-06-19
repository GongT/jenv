const debug = require('debug')('jenv:loader');

module.exports = function () {
	const configFilePath = process.env.CONFIG_FILE || process.env.JENV_FILE_NAME;
	if (!configFilePath) {
		throw new Error(`please set environment "CONFIG_FILE" or "JENV_FILE_NAME".`);
	}
	
	debug(`load config from ${configFilePath}`);
	if (!require('fs').existsSync(configFilePath)) {
		throw new Error(`config file ${configFilePath} not exists.`);
	}
	return require(configFilePath);
};

module.exports.load = module.exports;
let data;
Object.defineProperty(module.exports, 'data', {
	getter() {
		return data ? data :
				data = module.exports();
	},
	configurable: false,
	enumerable: true,
});

Object.defineProperty(exports, "__esModule", { value: true });
