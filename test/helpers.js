const { spawnSync } =require("child_process");
const tempDir = global.tempDir;
const { expect } = require('chai');
const { resolve, dirname } = require('path');
const mkdirpSync = require('mkdirp').sync;
const { existsSync, lstatSync, readFileSync, writeFileSync } = require('fs');

module.exports = {
	command,
	emptyStore() {
		const target = resolve(tempDir, random());
		command(['git', 'init', target]).to.success();
		return resolve(target, '.git');
	},
	emptyTempFolder(){
		const target = resolve(tempDir, random());
		mkdirpSync(target);
		return target;
	},
	random,
	localStorePath,
	globalStorePath,
	readJson,
	writeJson,
	isFile(file) {
		return existsSync(file) && lstatSync(file).isFile();
	},
	isDirectory(file) {
		return existsSync(file) && lstatSync(file).isDirectory();
	},
	isSymbolicLink(file) {
		return existsSync(file) && lstatSync(file).isSymbolicLink();
	},
	testEnvConfig(obj, rootVal, envVal) {
		expect(obj).to.have.property('valueRoot', rootVal);
		expect(obj).to.have.property('valueEnv', envVal);
		expect(obj).to.have.deep.property('\\.ENVIRONMENT.valueEnv', envVal);
	},
	writeEnvConfig(env, rootVal, envVal) {
		const varRoot = { valueRoot: rootVal };
		const varEnv = { valueEnv: envVal };
		
		writeJson(localStorePath(`.root/${env}.json`), varRoot);
		writeJson(localStorePath(`.environment/${env}.json`), varEnv);
	},
};

function command(cmd, options) {
	return expect(runCommand(cmd, options)).isCommand;
}

function random() {
	return 'r' + parseInt(4096 + Math.random() * 52539).toString(16)
}

function runCommand(cmd, options) {
	if (!options) {
		options = {};
	}
	if (!options.cwd) {
		options.cwd = tempDir;
	}
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

function writeJson(file, data) {
	let str = JSON.stringify(data, null, 8);
	str = str.replace(/^\s+/gm, function (m0) {
		return (new Array(parseInt(m0.length / 8))).fill('\t').join('');
	});
	const dir = dirname(file);
	if (!existsSync(dir)) {
		mkdirpSync(dir);
	}
	return writeFileSync(file, str, 'utf-8');
}
function readJson(file) {
	try {
		//noinspection TypeScriptUnresolvedFunction
		return JSON.parse(readFileSync(file, 'utf-8'));
	} catch (e) {
		e.message += ` (in file ${file})`;
		throw e;
	}
}
function localStorePath(path) {
	return resolve(tempDir, '.jsonenv/local', path);
}
function globalStorePath(storeName, path) {
	return resolve(homeDir, '.jsonenv', storeName, path);
}
