import {isatty} from 'tty';

import {getCurrentDefault} from "../actions/current-config";
import readEnvSync from "../actions/read-env";
import MyError from "../library/error";

export default function ls(envName) {
	envName = envName || getCurrentDefault();
	if (!envName) {
		throw new MyError('no default config. use "jenv --default" to set it. or specify a config name.');
	}
	const config = readEnvSync(envName);
	
	if (isatty(process.stdout.fd)) {
		console.log(require('util').inspect(config, {colors: true, depth: 999}));
	} else {
		console.log(JSON.stringify(config, null, 4));
	}
}
