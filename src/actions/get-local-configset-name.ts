import {existsSync} from "fs";
import {resolve} from "path";
import {readJsonFile} from "../library/json";
import {configSetPath} from "../library/path";

export function getLocalConfigName() {
	const d = configSetPath('local', false);
	const idFile = resolve(d, `.jsonenv`);
	if (existsSync(idFile)) {
		const install = readJsonFile(idFile);
		return install.name;
	}
}
