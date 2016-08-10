const path = require('path');
const fs = require('fs');
const os = require('os');
const mkdirp = require('mkdirp');
const homedir = require('homedir');
const fsUtils = require('nodejs-fs-utils');
const nodeSpawnSync = require('child_process').spawnSync;
const nodeExecSync = require('child_process').execSync;
const extend = require('extend');

const DEFAULT_FILE = path.resolve(process.cwd(), './.jsonenv/default');
const TEMP_FILE = path.resolve(process.cwd(), './.jsonenv/', `_current_result.json`);
const DEFAULT_FILE_PATH = path.resolve(process.cwd(), './.jsonenv');

/*function md5(str) {
 return require('crypto').createHash('md5').update(str).digest("hex");
 }*/

const lib = {};

(function () {
	
	let env;
	
	function getCurrentEnv() {
		if (!env) {
			if (fs.existsSync(DEFAULT_FILE)) {
				try {
					env = JSON.parse(fs.readFileSync(DEFAULT_FILE));
				} catch (e) {
					env = {};
				}
			} else {
				return {};
			}
		}
		return env;
	}
	
	function writeCurrentEnv() {
		mkdirp.sync(DEFAULT_FILE_PATH);
		try {
			fs.writeFileSync(DEFAULT_FILE, JSON.stringify(env), 'utf-8');
			return true;
		} catch (e) {
			return false;
		}
	}
	
	lib.setCurrentDefault = function setCurrentDefault(def) {
		const env = getCurrentEnv();
		env.default = def;
		writeCurrentEnv();
	};
	lib.getCurrentDefault = function getCurrentDefault() {
		return getCurrentEnv().default;
	};
	lib.setCurrentConfigSet = function setCurrentConfigSet(configSet) {
		const env = getCurrentEnv();
		env.set = configSet;
		writeCurrentEnv();
	};
	lib.getCurrentConfigSet = function getCurrentConfigSet() {
		return getCurrentEnv().set;
	};
})();

lib.getAllEnv = (setName) => {
	const dir = lib.getConfigSetPath(setName || lib.getCurrentConfigSet());
	if (!dir) {
		throw new MyError(`config set "${setName}" do not exists`);
	}
	return fs.readdirSync(dir).filter((fn) => {
		if (fn !== 'default.json' && /^[a-zA-Z0-9\-_]+\.json$/.test(fn)) {
			return true;
		}
	}).map((fn) => {
		return fn.replace(/\.json$/, '');
	});
};

module.createConfigSet = require('./config-set-create.js');
module.updateConfigSet = require('./config-set-update.js');

lib.applyGlobalEnv = function applyGlobalEnv(config) {
	process.env.JENV_FILE_NAME = config.JENV_FILE_NAME; // ensure first
	process.env.JENV_FILE_NAME_REL = config.JENV_FILE_NAME_REL
	Object.keys(config).forEach((key) => {
		let value = config[key];
		if (value instanceof Date) {
			value = value.toISOString();
		} else if (value === null || value === undefined) {
			value = '';
		} else if (typeof value === 'boolean') {
			value = value ? 'yes' : '';
		} else if (Array.isArray(value) && typeof value[0] !== 'object') {
			value = value.join(',');
		} else if (typeof value === 'object') {
			return; // no object will assign
		}
		process.env[constant_name_style(key.toString())] = value;
	});
};

lib.readEnvSync = function readEnvSync(name) {
	const setName = lib.getCurrentConfigSet();
	if (!setName) {
		throw new MyError('config set has not define, use "jenv --set" or "jenv --pull" to set it.');
	}
	
	const setPath = lib.getConfigSetPath(setName);
	if (!setPath) {
		throw new MyError(`config set "${setName}" do not exists`);
	}
	
	function getFileContent(dir, allowImplicitDefault) {
		const defaultFile = path.resolve(dir, `default.json`);
		const defaultExists = fs.existsSync(defaultFile);
		
		if (defaultExists) {
			console.log('-> %s', defaultFile);
		}
		
		const ret = defaultExists ? parseJsonFile(defaultFile) : {};
		
		// read current
		const confFile = path.resolve(dir, `${name}.json`);
		if (fs.existsSync(confFile)) {
			console.log('-> %s', confFile);
			extend(ret, parseJsonFile(confFile));
		} else {
			if (allowImplicitDefault && defaultExists) {
				// just use default
			} else {
				throw new Error(`required config file "${confFile}" not found.`);
			}
		}
		return ret;
	}
	
	const result = {};
	
	function parseFolder(itr, dir, isRoot) {
		extend(true, itr, getFileContent(dir, !isRoot));
		fs.readdirSync(dir).forEach((name) => {
			if (/^\./.test(name)) {
				return;
			}
			const subFile = path.resolve(dir, name);
			if (fs.lstatSync(subFile).isDirectory()) {
				itr[name] = {};
				parseFolder(itr[name], subFile, false);
			}
		});
	}
	
	parseFolder(result, setPath, true);
	
	fs.writeFileSync(TEMP_FILE, JSON.stringify(result), 'utf-8');
	result.JENV_FILE_NAME = TEMP_FILE;
	result.JENV_FILE_NAME_REL = TEMP_FILE.replace(process.cwd() + '', '.');
	return result;
};
function parseJsonFile(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (e) {
		e.message += ` (in file ${file})`;
		throw e;
	}
}
lib.createConfigSet = function createConfigSet(name, global) {
	const targetPath = configSetPath(name)[global ? 1 : 0];
	if (fs.existsSync(targetPath)) {
		throw new MyError(`target path ${targetPath} is already exists, please remove it first.`);
	}
	mkdirp.sync(path.dirname(targetPath));
	let ret;
	ret = spawnSync('git', ['init', targetPath]);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
	try {
		const installFile = path.resolve(targetPath, '.jsonenv');
		fs.writeFileSync(installFile, JSON.stringify({
			name: name,
		}), 'utf-8');
		
		const gitignoreFile = path.resolve(targetPath, '.gitignore');
		fs.writeFileSync(gitignoreFile, `
.idea
`, 'utf-8');
		
		ret = spawnSync('git', ['add', '.'], targetPath);
		if (!ret) {
			throw new MyError('run git command failed. (see above)');
		}
		ret = spawnSync('git', ['commit', '-a', '-m', 'init'], targetPath);
		if (!ret) {
			throw new MyError('run git command failed. (see above)');
		}
		
		ret = spawnSync('git', ['branch', 'jsonenv'], targetPath);
		if (!ret) {
			throw new MyError('run git command failed. (see above)');
		}
		ret = spawnSync('git', ['checkout', 'jsonenv'], targetPath);
		if (!ret) {
			throw new MyError('run git command failed. (see above)');
		}
		ret = spawnSync('git', ['branch', '-D', 'master'], targetPath);
		if (!ret) {
			throw new MyError('run git command failed. (see above)');
		}
		
	} catch (e) {
		fsUtils.rmdirsSync(targetPath);
		throw e;
	}
	lib.setCurrentConfigSet(lib.getLocalConfigName());
	return targetPath;
};
lib.fetchConfigSet = function fetchConfigSet(name, global, force) {
	const targetPath = configSetPath(name)[global ? 1 : 0];
	if (fs.existsSync(targetPath)) {
		if (force) {
			fsUtils.rmdirsSync(targetPath);
		} else {
			throw new MyError(`target path ${targetPath} is already exists, please remove it first.`);
		}
	}
	mkdirp.sync(path.dirname(targetPath));
	
	let ret = spawnSync('git', ['clone', name, targetPath]);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
	ret = spawnSync('git', ['checkout', 'jsonenv'], targetPath);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
	
	let ins;
	try {
		const installFile = path.resolve(targetPath, '.jsonenv');
		ins = JSON.parse(fs.readFileSync(installFile, 'utf-8'));
	} catch (e) {
		fsUtils.rmdirsSync(targetPath);
		throw new MyError(`source git ${name} is not a config set: ${e.message}`);
	}
	if (!ins || !ins.name) {
		throw new MyError(`source git ${name} is not a config set: name not defined`);
	}
	
	lib.setCurrentConfigSet(lib.getLocalConfigName());
	return ins.name;
};

lib.getSavePath = (envName, global) => {
	return configSetPath(envName)[global ? 1 : 0];
};

lib.setRemote = (path, newRemote) => {
	if (!lib.spawnSync('git', ['remote', 'add', 'origin', newRemote], path)) {
		if (!lib.spawnSync('git', ['remote', 'set-url', 'origin', newRemote], path)) {
			console.error(`can't run "git remote" command.`);
			return false;
		}
	}
	if (!lib.spawnSync('git', ['push', '--set-upstream', 'origin', 'jsonenv'], path)) {
		console.error(`can't run "git push" command.`);
	}
	return true;
};
lib.uploadRemote = function (gitPath) {
	gitcheck(gitPath);
	
	if (!lib.spawnSync('git', ['add', '.'], gitPath)) {
		console.error(`can't run "git add" command.`);
		return false;
	}
	if (!lib.spawnSync('git', ['commit', '-a', '-m', 'manual upload'], gitPath)) {
		console.error(`can't run "git commit" command.`);
	}
	if (!lib.spawnSync('git', ['push'], gitPath)) {
		console.error(`can't run "git push" command.`);
		return false;
	}
	return true;
};
lib.downloadRemote = function (gitPath) {
	gitcheck(gitPath);
	
	if (!lib.spawnSync('git', ['pull'], gitPath)) {
		console.error(`can't run "git pull" command.`);
		return false;
	}
	return true;
};
function gitcheck(path) {
	let ret = nodeExecSync(`git branch --color=never`, { cwd: path, stdio: 'pipe' });
	if (!/\* jsonenv/.test(ret)) {
		throw new MyError(`refuse to run in path ${path}: not a git repo on "jsonenv" branch`);
	}
}

function configSetPath(envName) {
	const local = path.resolve(process.cwd(), '.jsonenv/local');
	const home = path.resolve(homedir(), '.jsonenv', envName);
	return [local, home];
}

lib.getLocalConfigName = () => {
	const d = configSetPath('local')[0];
	const idFile = path.resolve(d, `.jsonenv`);
	if (fs.existsSync(idFile)) {
		const install = JSON.parse(fs.readFileSync(idFile));
		return install.name;
	}
};
lib.getConfigSetPath = (setName) => {
	let dir;
	const found = configSetPath(setName).some((d) => {
		const idFile = path.resolve(d, `.jsonenv`);
		if (fs.existsSync(idFile)) {
			const install = JSON.parse(fs.readFileSync(idFile));
			dir = d;
			return install.name === setName;
		}
	});
	if (found) {
		return dir;
	} else {
		return false;
	}
};
lib.newEnv = (dir, name) => {
	const targetFile = path.resolve(dir, `${name}.json`);
	
	if (fs.existsSync(targetFile)) {
		throw new MyError(`target file ${targetFile} already exists.`);
	}
	
	let def = {};
	try {
		def = lib.readEnvSync('default');
	} catch (e) {
	}
	fs.writeFileSync(targetFile, JSON.stringify(def), 'utf-8');
	
	let ret = spawnSync('git', ['add', '.'], dir);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
	ret = spawnSync('git', ['commit', '-a', '-m', `create new env ${name}`], dir);
	if (!ret) {
		throw new MyError('run git command failed. (see above)');
	}
	
	return true;
};
function spawnSync(cmd, args, options) {
	if (!options) {
		options = {};
	}
	if (typeof options === 'string') {
		options = { cwd: options };
	}
	options.stdio = 'inherit';
	
	console.error('::: ', cmd, args.join(' '));
	
	const ret = nodeSpawnSync(cmd, args, options);
	return ret.status === 0;
}
lib.spawnSync = spawnSync;

function constant_name_style(str) {
	if (str.toUpperCase() === str) {
		return str;
	}
	return str.replace(/([a-z])([A-Z])/g, (m0, first, next) => {
		return `${first}_${next.toUpperCase()}`;
	}).toUpperCase();
}

module.exports = lib;
