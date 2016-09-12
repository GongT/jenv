import {getCurrentDefault} from "../actions/current-config";
import readEnvSync from "../actions/read-env";
import {applyGlobalEnv} from "../actions/apply-global-env";
export default function repl(this:CmdLineConfig) {
	const envName = getCurrentDefault();
	const config = readEnvSync(envName);
	applyGlobalEnv(config);
	
	global.JsonEnv = config;
	console.log('config stored in glboal.JsonEnv');
	const repl = require('repl');
	
	repl.start({
		useGlobal: true,
		ignoreUndefined: false,
		replMode: repl.REPL_MODE_MAGIC,
		breakEvalOnSigint: true,
		prompt: '> '
	});
	
	return 999;
}
