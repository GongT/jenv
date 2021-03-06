import {spawnSync, execSync, SpawnSyncOptions, ExecSyncOptions} from "child_process";
import {prettyPrint} from "./output";
const extend = require('util')._extend;

const env_english = extend({}, process.env);
env_english.LANG = 'en_US.utf-8';

export function nodeExecSync(command: string, path: string, input: string = ''): string {
	if (prettyPrint) {
		console.error('::: ', command);
	}
	
	return execSync(command, <ExecSyncOptions>{
		cwd: path,
		stdio: 'pipe',
		encoding: 'utf8',
		env: env_english,
		input: input
	}).toString('utf8').trim();
}

export function nodeSpawnSync(cmd: string, args: string[], options: SpawnSyncOptions = {}) {
	if (typeof options === 'string') {
		options = {
			cwd: <string>options,
			stdio: 'inherit',
			env: env_english,
		};
	} else {
		options.stdio = 'inherit';
		options.env = env_english;
	}
	
	if (prettyPrint) {
		console.error('::: ', cmd, args.join(' '));
	}
	
	const ret = spawnSync(cmd, args, options);
	return ret.status === 0;
}
