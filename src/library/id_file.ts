import {resolve, dirname} from "path";
import {existsSync} from "fs";
import {readJsonFile} from "./json";
import MyError from "./error";

export function readIdFile(setPath): ConfigsetIdFile {
	
	const installFile = resolve(setPath, 'environments.json');
	if (!existsSync(installFile)) {
		if (existsSync(dirname(installFile))) {
			throw new MyError(`"${setPath}" is exists but not a jsonenv storage.`);
		} else {
			throw new MyError(`"${setPath}" is not exists.`);
		}
	}
	return readJsonFile(installFile);
}
