import {spawnSync, SpawnSyncOptions} from "child_process";

export function nodeSpawnSync(cmd: string, args: string[], options: SpawnSyncOptions = {}) {
	if (typeof options === 'string') {
		options = {
			cwd: <string>options,
			stdio: 'inherit',
		};
	} else {
		options.stdio = 'inherit';
	}
	
	console.error('::: ', cmd, args.join(' '));
	
	const ret = spawnSync(cmd, args, options);
	return ret.status === 0;
}
