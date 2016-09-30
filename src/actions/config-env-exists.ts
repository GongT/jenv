import {getAllEnv} from "./get-all-env";
import {requireCurrentConfigSet} from "../library/current";

export function configEnvExists(env, withAbstract = false) {
	const cset = requireCurrentConfigSet();
	const available = getAllEnv(cset, withAbstract);
	return available.indexOf(env) !== -1;
}
