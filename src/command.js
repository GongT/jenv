const lib = require('./lib');
const path = require('path');

module.exports = (command, args, options) => {
	if (!CommandList.hasOwnProperty(command)) {
		console.error(`unknown command "${command}"`);
		throw require('./usage.js');
	}
	const ret = CommandList[command].apply(options, args);
	if (ret === true || ret === undefined) {
		return 0;
	} else if (ret === false) {
		return 1;
	} else {
		return ret;
	}
};

const CommandList = {
	// public command
	usage() {
		throw require('./usage.js');
	},
	help() {
		throw require('./usage.js');
	},
	// local part
	default(setValue) {
		if (setValue) {
			if (!configEnvExists(setValue)) {
				if (this.create) {
					CommandList.new(setValue);
				} else {
					throw new MyError(`can't find env "${setValue}"`);
				}
			}
			return lib.setCurrentDefault(setValue);
		} else {
			if (lib.getCurrentDefault()) {
				console.log(lib.getCurrentDefault());
				return true;
			} else {
				console.log('no default');
				return false;
			}
		}
	},
	pull(gitUrl) {
		if (!gitUrl) {
			throw require('./usage.js');
		}
		const { name, path } = lib.fetchConfigSet(gitUrl, this.global, this.force);
		console.log('pull success: the config set is saved to %s', path);
		return lib.setCurrentConfigSet(name);
	},
	set(configSetName) {
		if (!configSetName) {
			throw require('./usage.js');
		}
		if ('local' === configSetName) {
			configSetName = lib.getLocalConfigName();
		}
		const path = requireConfigSetPath(configSetName);
		return lib.setCurrentConfigSet(configSetName);
	},
	get() {
		if (lib.getCurrentConfigSet()) {
			console.log(lib.getCurrentConfigSet());
			return true;
		} else {
			console.log('no config set');
			return false;
		}
	},
	ls(envName) {
		envName = envName || lib.getCurrentDefault();
		if (!envName) {
			console.log('no default config. use "jenv --default" to set it. or specify a config name.');
			return false;
		}
		const config = lib.readEnvSync(envName);
		console.log(require('util').inspect(config, { colors: true, depth: 999 }));
	},
	status() {
		const env = lib.getCurrentDefault();
		const set = lib.getCurrentConfigSet();
		const setPath = set ? requireConfigSetPath(set) : null;
		const envList = set ? lib.getAllEnv(set) : [];
		console.log(`
${t('current_set')}: ${set || t('not_set')}
${t('current_env')}: ${env || t('not_set')}
${t('set_save_path')}: ${setPath || t('not_set')}
${t('env_file_path')}: ${(setPath && env) ? path.resolve(setPath, env + '.json') : t('not_set')}

${t('available_env')}:
  ${envList.length ? envList.join('\n  ') : t('zero_length')}
`)
	},
	// global part
	init(newName, gitUrl) {
		if (!newName) {
			throw require('./usage.js');
		}
		if (newName === 'local' || newName === 'default') {
			console.error(`you can't use %s as name`, newName);
			return false;
		}
		
		const savePath = lib.createConfigSet(newName, this.global);
		
		console.log('new config set saved to %s', savePath);
		
		if (gitUrl) {
			CommandList.remote(newName, gitUrl);
		} else {
			console.log('  configure remote storage with "jenv --remote git@github.com:/yourname/yourproject"');
		}
		
		if (!this['no-default']) {
			CommandList.set(newName);
		}
		
		return !!savePath;
	},
	remote(configSetName, remoteUrl){
		if (remoteUrl === undefined) {
			if (/^[a-zA-Z0-9\-_]+$/.test(configSetName)) {
				throw new MyError('env name must be /[a-zA-Z0-9\-_]+/');
			}
			remoteUrl = configSetName;
			configSetName = undefined;
		}
		return lib.setRemote(requireConfigSetPath(configSetName), remoteUrl);
	},
	upload(configSetName){
		return lib.uploadRemote(requireConfigSetPath(configSetName));
	},
	download(configSetName){
		return lib.downloadRemote(requireConfigSetPath(configSetName));
	},
	new(newConfigEnvName){
		if (!/^[a-zA-Z0-9\-_]+$/.test(newConfigEnvName)) {
			throw new MyError('env name must be /[a-zA-Z0-9\-_]+/');
		}
		if (newConfigEnvName === 'local' || newConfigEnvName === 'default') {
			console.error(`you can't use %s as name`, newConfigEnvName);
			return false;
		}
		
		return lib.newEnv(requireConfigSetPath(), newConfigEnvName);
	},
	repl() {
		const envName = lib.getCurrentDefault();
		const config = lib.readEnvSync(envName);
		lib.applyGlobalEnv(config);
		
		global.JsonEnv = config;
		console.log('config stored in glboal.JsonEnv');
		require('./repl');
		
		return 999;
	},
};

function requireConfigSetPath(configSetName) {
	if (!configSetName) {
		configSetName = lib.getCurrentConfigSet();
		if (!configSetName) {
			throw new MyError('current config set not set');
		}
	}
	
	const path = lib.getConfigSetPath(configSetName);
	if (!path) {
		throw new MyError(`config set "${configSetName}" not exists`);
	}
	return path;
}
function requireCurrentConfigSet() {
	const cset = lib.getCurrentConfigSet();
	if (!cset) {
		throw new MyError('no config set');
	}
	return cset;
}
function configEnvExists(env) {
	const cset = requireCurrentConfigSet();
	const available = lib.getAllEnv(cset);
	return available.indexOf(env) !== -1;
}
