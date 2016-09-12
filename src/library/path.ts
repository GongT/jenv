import {resolve} from "path";
import {homedir} from "os";
import {existsSync} from 'fs';

import {readJsonFile} from "./json";
import MyError from "./error";
import {getCurrentConfig} from "./current";

export function configSetPath(envName): string[];
export function configSetPath(envName, isGlobal: boolean):string;
export function configSetPath(envName, isGlobal?):string|string[] {
	const local = resolve(process.cwd(), '.jsonenv/local');
	const home = resolve(homedir(), '.jsonenv', envName);
	if (isGlobal === true) {
		return home;
	} else if (isGlobal === false) {
		return local;
	} else {
		return [local, home];
	}
}

export function findConfigSetPath(setName) {
	let dir;
	const found = configSetPath(setName).some((d) => {
		const idFile = resolve(d, `environments.json`);
		if (existsSync(idFile)) {
			const install = readJsonFile(idFile);
			dir = d;
			return install.name === setName;
		}
	});
	if (found) {
		return dir;
	} else {
		return false;
	}
}

export function requireConfigSetPath(configSetName) {
	if (!configSetName) {
		configSetName = getCurrentConfig().set;
		if (!configSetName) {
			throw new MyError('current config set not set');
		}
	}
	
	const path = findConfigSetPath(configSetName);
	if (!path) {
		throw new MyError(`config set "${configSetName}" not exists`);
	}
	return path;
}
