import {configSetPath} from "../library/path";
export function getSavePath(envName, global) {
	return configSetPath(envName, !!global);
}
