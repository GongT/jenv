import {getCurrentConfig, writeCurrentEnv} from "../library/current";

export function setCurrentDefault(env) {
	const config = getCurrentConfig();
	config.env = env;
	return writeCurrentEnv();
}
export function getCurrentDefault() {
	return getCurrentConfig().env;
}
export function setCurrentConfigSet(configSet) {
	const config = getCurrentConfig();
	config.set = configSet;
	delete config.env;
	return writeCurrentEnv();
}
export function getCurrentConfigSet() {
	return getCurrentConfig().set;
}
