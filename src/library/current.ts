import {existsSync} from "fs";
import {sync as mkdirpSync} from "mkdirp";
import {dirname, resolve} from "path";
import {readJsonFile, writeJsonFile} from "./json";
import MyError from "./error";

export const DEFAULT_FILE = resolve(process.cwd(), './.jsonenv/default');

interface EnvLocalConfigClass {
	set?: string;
	env?: string;
}
let env_cache: EnvLocalConfigClass;

export function getCurrentConfig() {
	if (!env_cache) {
		if (existsSync(DEFAULT_FILE)) {
			env_cache = readJsonFile(DEFAULT_FILE);
		} else {
			env_cache = {};
		}
	}
	return env_cache;
}
export function writeCurrentEnv() {
	mkdirpSync(dirname(DEFAULT_FILE));
	return writeJsonFile(DEFAULT_FILE, env_cache);
}

export function requireCurrentEnvironment() {
	const cenv = getCurrentConfig().env;
	if (!cenv) {
		throw new MyError(`current environment not set. (${DEFAULT_FILE})`);
	}
	return cenv;
}

export function requireCurrentConfigSet() {
	const cset = getCurrentConfig().set;
	if (!cset) {
		throw new MyError('current configset not set. (${DEFAULT_FILE})');
	}
	return cset;
}
