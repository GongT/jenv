const os = require('os');
const lib = require('./lib');
const nodeSpawnSync = require('child_process').spawnSync;

module.exports = (args) => {
	if (args === 'shell') {
		args = [os.platform() === 'win32' ? 'cmd.exe' : 'bash'];
	}
	
	const child = nodeSpawnSync(args[0], args.slice(1), {
		stdio: 'inherit',
		cwd: process.cwd(),
		env: process.env,
	});
	if (child) {
		if (child.error) {
			console.error(`can't run command "${args[0]}"\n  %s`, child.error.message);
			return child.status || 255;
		} else {
			return child.status;
		}
	} else {
		console.error(`can't run command "${args[0]}"`);
		return 255
	}
};
