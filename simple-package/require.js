module.exports = function () {
	const configFilePath = process.env.CONFIG_FILE || process.env.JENV_FILE_NAME;
	if (!configFilePath) {
		throw new Error(`please set environment "CONFIG_FILE" or "JENV_FILE_NAME".`);
	}
	
	console.error(`load config from ${configFilePath}`);
	if (!require('fs').existsSync(configFilePath)) {
		throw new Error(`config file ${configFilePath} not exists.`);
	}
	return require(configFilePath);
};

Object.defineProperty(exports, "__esModule", { value: true });
