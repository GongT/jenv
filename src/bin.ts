/// <reference types="node" />
/// <reference path="../global.d.ts" />

import "source-map-support/register";
import usage from "./actions/usage";
import installI18N from "./library/i18n";
import {platform} from "os";
import MyError from "./library/error";
import readEnvSync from "./actions/read-env";
import {getCurrentDefault} from "./actions/current-config";
import shellSpawnSync from "./library/shell";
import {applyGlobalEnv} from "./actions/apply-global-env";

interface AvailableCmdOptions {
	[id: string]: boolean | string;
}

const args: string[] = process.argv.slice(2);

installI18N();
if (!args.length) {
	throw usage();
}
let firstArg = args.shift();

if (args.length === 0 && /^shell$/.test(firstArg)) {
	firstArg = platform() === 'win32' ? 'cmd.exe' : '/usr/bin/bash';
}

const isCommand = /^--/.test(firstArg);
const isEnv = !isCommand && /^-/.test(firstArg);

if (isCommand) {
	const cmd_options: AvailableCmdOptions = {};
	const cmd_args = args.filter(function (item) {
		if (/^--/.test(item)) {
			const match = /^--(.+?)(=(.+))?$/.exec(item);
			if (!match) {
				console.error('unknwon argument %s', item);
				process.exit(1);
			}
			cmd_options[match[1]] = match[3] === undefined ? true : match[3];
			return false;
		} else if (/^-/.test(item)) {
			if (cmd_options['envName']) {
				console.error('duplicate env argument %s', item);
				process.exit(1);
			}
			cmd_options['envName'] = item.replace(/^-/, '');
		} else {
			return true;
		}
	});
	
	try {
		const ret = require('./run_command')(firstArg.replace(/^--/, ''), cmd_args, cmd_options);
		if (ret === 999) {
			process.exit(0);
		}
		process.exit(ret);
	} catch (e) {
		if (e instanceof MyError) {
			if (e.message !== 'ignore') {
				console.error(e.message);
			}
			process.exit(1);
		} else {
			throw e;
		}
	}
} else { // is env name
	let envName;
	if (isEnv) {
		envName = firstArg.replace(/^-/, '');
	} else {
		envName = getCurrentDefault();
		args.unshift(firstArg);
	}
	
	let config;
	try {
		config = readEnvSync(envName);
	} catch (err) {
		console.error(`\x1B[38;5;9mcan't load environment "${envName}":\x1B[0m`);
		displayError(err.stack);
		process.exit(1);
	}
	
	applyGlobalEnv(config);
	const ret = shellSpawnSync(args);
	process.exit(ret);
}

function displayError(stack: string) {
	const err = stack.split(/\n/g).slice(0, 3);
	if (err[1]) {
		err[1] = '\x1B[2m' + err[1];
	}
	console.error(err.join('\n') + '\x1B[0m');
}
