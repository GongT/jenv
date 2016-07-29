const os = require('os');
const exec = require('child_process').exec;

module.exports = (args) => {
	if (args === 'shell') {
		args = [os.platform() === 'win32' ? 'cmd.exe' : 'bash'];
	}
	
	const child = exec(args.join(' '), {
		stdio: 'inherit',
		cwd: process.cwd(),
		env: process.env,
	});
	child.on('close', (code) => {
		process.exit(code);
	});
};
