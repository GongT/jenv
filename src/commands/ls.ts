import {getCurrentDefault} from "../actions/current-config";
import readEnvSync from "../actions/read-env";

export default function ls(envName) {
	envName = envName || getCurrentDefault();
	if (!envName) {
		console.log('no default config. use "jenv --default" to set it. or specify a config name.');
		return false;
	}
	const config = readEnvSync(envName);
	console.log(require('util').inspect(config, { colors: true, depth: 999 }));
}
