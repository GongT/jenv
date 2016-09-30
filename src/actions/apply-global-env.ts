import {constant_name_style} from "../library/strings";

export function applyGlobalEnv(config: JsonEnvClass) {
	process.env.JENV_FILE_NAME = config.JENV_FILE_NAME; // ensure first
	process.env.JENV_FILE_NAME_REL = config.JENV_FILE_NAME_REL;
	const env = config['.ENVIRONMENT'];
	if (!env) {
		return;
	}
	
	require('util')._extend(process.env, env);
}

export function changeVariableNames(config) {
	const env = config['.ENVIRONMENT'];
	const ret = {};
	Object.keys(env).forEach((key) => {
		let value = env[key];
		if (value instanceof Date) {
			value = value.toISOString();
		} else if (value === null || value === undefined) {
			value = '';
		} else if (typeof value === 'boolean') {
			value = value ? 'yes' : '';
		} else if (Array.isArray(value) && typeof value[0] !== 'object') {
			value = value.join(',');
		} else if (typeof value === 'object') {
			console.error('warn: not apply to environment variable - %s: value is not scalar', key);
			return; // no object will assign
		}
		ret[constant_name_style(key.toString())] = value;
	});
	config['.ENVIRONMENT'] = ret;
}
