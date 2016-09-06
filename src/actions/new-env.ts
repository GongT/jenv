import {existsSync} from "fs";
import {readJsonFile, writeJsonFile} from "../library/json";
import {gitadd, gitcommit} from "../library/git";
import {resolve} from "path";

export function newEnvironment(dir, name, base, skipGit = false) {
	const targetFile = resolve(dir, `environments.json`);
	
	if (!existsSync(targetFile)) {
		console.error(`error: target file ${targetFile} not exists.`);
		return false;
	}
	
	let def = readJsonFile(targetFile);
	if (!def.environments) {
		def.environments = {};
	}
	if (def.environments[name]) {
		console.error(`info: environment ${name} already exists.`);
		return true;
	}
	def.environments[name] = {
		"inherits": base === undefined ? 'default' : base,
	};
	writeJsonFile(targetFile, def);
	
	const rootFile = resolve(dir, `.root/${name}.json`);
	if (!existsSync(rootFile)) {
		writeJsonFile(rootFile, {});
	}
	const envFile = resolve(dir, `.environment/${name}.json`);
	if (!existsSync(envFile)) {
		writeJsonFile(envFile, {});
	}
	
	if (!skipGit) {
		gitadd(dir);
		gitcommit(dir, `create new env ${name}`);
	}
}
