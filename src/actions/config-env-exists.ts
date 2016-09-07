import {getAllEnv} from "./get-all-env";
import {requireCurrentConfigSet} from "../library/current";

export function configEnvExists(env) {
	const cset = requireCurrentConfigSet();
	const available = getAllEnv(cset);
	return available.indexOf(env) !== -1;
}
