const { spawnSync } =require("child_process");
const tempDir = global.tempDir;
const { expect } = require('chai');
const { resolve } = require('path');

module.exports = {
	command(cmd, options) {
		return expect(runCommand(cmd, options)).isCommand;
	},
};

function runCommand(cmd, options) {
	if (!options) {
		options = {};
	}
	options.cwd = tempDir;
	options.stdio = 'pipe';
	
	if (typeof cmd === 'string') {
		cmd = [cmd];
	}
	let [command,...args] = cmd;
	if (!args) {
		args = [];
	}
	
	const cmdline = command + (args.length ? ' "' : '') + args.join('" "') + (args.length ? '"' : '');
	
	if (command === 'jenv') {
		command = process.argv[0];
		args.unshift(resolve(__dirname, '../bin/jenv'));
	}
	
	const p = spawnSync(command, args, options);
	p.command = cmdline;
	return p;
}
