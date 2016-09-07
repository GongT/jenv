import {constant_name_style} from "../library/strings";

export function applyGlobalEnv(config: JsonEnv) {
	process.env.JENV_FILE_NAME = config.JENV_FILE_NAME; // ensure first
	process.env.JENV_FILE_NAME_REL = config.JENV_FILE_NAME_REL;
	const env = config['.ENVIRONMENT'];
	if (!env) {
		return;
	}
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
		process.env[constant_name_style(key.toString())] = value;
	});
}
