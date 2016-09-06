import {requireCurrentConfigSet} from "./require-current-configset";
import {getAllEnv} from "./get-all-env";

export function configEnvExists(env) {
	const cset = requireCurrentConfigSet();
	const available = getAllEnv(cset);
	return available.indexOf(env) !== -1;
}
