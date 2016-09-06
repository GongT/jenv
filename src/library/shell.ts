import {platform}  from 'os';
import {spawnSync} from 'child_process';

export default function shellSpawnSync(args) {
	if (args === 'shell') {
		args = [platform() === 'win32' ? 'cmd.exe' : 'bash'];
	}
	
	console.log('::: %s', args.join(' '));
	
	const child = spawnSync(args[0], args.slice(1), {
		stdio: 'inherit',
		cwd: process.cwd(),
		env: process.env,
	});
	if (child) {
		if (child.error) {
			console.error(`can't run command "${args[0]}"\n  %s`, child.error.message);
			return child.status || 127;
		} else {
			return child.status;
		}
	} else {
		console.error(`can't run command "${args[0]}"`);
		return 127;
	}
};
