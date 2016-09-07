import {existsSync} from "fs";
import {resolve} from "path";
import {readJsonFile} from "../library/json";
import {configSetPath} from "../library/path";
import MyError from "../library/error";

export function getLocalConfigName() {
	const d = configSetPath('local', false);
	const idFile = resolve(d, 'environments.json');
	console.log(idFile);
	if (existsSync(idFile)) {
		const install = readJsonFile(idFile);
		if(!install.name){
			throw new MyError('local config set broken');
		}
		return install.name;
	}else{
		return false;
	}
}
