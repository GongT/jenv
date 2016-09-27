global.JsonEnv = require('./require')();

if (process.env.JENV_SERVICE_NAME) {
	global.AppConfig = global.JsonEnv[process.env.JENV_SERVICE_NAME]
}
