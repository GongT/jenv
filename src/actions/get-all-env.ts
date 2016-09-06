import {getCurrentConfigSet} from "./current-config";
import {requireConfigSetPath} from "../library/path";
import {readIdFile} from "../library/id_file";

export function getAllEnv(setName): string[] {
	const dir = requireConfigSetPath(setName || getCurrentConfigSet());
	
	return Object.keys(readIdFile(dir).environments);
}
