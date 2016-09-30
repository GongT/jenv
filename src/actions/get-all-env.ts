import {getCurrentConfigSet} from "./current-config";
import {requireConfigSetPath} from "../library/path";
import {readIdFile} from "../library/id_file";

export function getAllEnv(setName, withAbstract = false): string[] {
	const dir = requireConfigSetPath(setName || getCurrentConfigSet());
	const envs = readIdFile(dir).environments;
	if (withAbstract) {
		return Object.keys(envs);
	} else {
		return Object.keys(envs).filter((name) => {
			return !envs[name].abstract;
		});
	}
}
