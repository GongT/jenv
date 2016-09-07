const { resolve } = require('path');
const { rmdirsSync } =require("nodejs-fs-utils");
const { existsSync } = require('fs');
const mkdirpSync = require("mkdirp").sync;
const tempDir = global.tempDir;
const tempTargetDir = resolve(tempDir, '.jsonenv');

const { command, random } = require('./helpers');

before('init temp dir', () => {
	process.env.LANG = 'en-us';
	process.chdir('/');
	if (existsSync(tempDir)) {
		rmdirsSync(tempDir);
	}
	mkdirpSync(tempDir);
	process.chdir(tempDir);
	console.log('before run: %s', process.cwd());
});
after('cleanup temp dir', () => {
	if (existsSync(tempDir)) {
		rmdirsSync(tempDir);
	}
	console.log('cleanup: %s', tempDir);
	console.log('');
});

module.exports.describe = function (key, fn, ...args) {
	let cb;
	if (typeof key === 'function') {
		cb = wrap(key, false);
		args.unshift(fn);
		args.unshift(cb);
	} else {
		cb = wrap(fn, false);
		args.unshift(cb);
		args.unshift(key);
	}
	
	return describe.apply(undefined, args);
};

module.exports.describeStorage = function (key, fn, ...args) {
	let cb;
	if (typeof key === 'function') {
		cb = wrap(key, true);
		args.unshift(fn);
		args.unshift(cb);
	} else {
		cb = wrap(fn, true);
		args.unshift(cb);
		args.unshift(key);
	}
	
	return module.exports.describe.apply(undefined, args);
};

function wrap(fn, autoInit) {
	return function (...args) {
		if (autoInit) {
			before('prepare config set', function () {
				const setname = random();
				args.unshift(setname);
				command(['jenv', '--init', setname]).will.success();
			});
		}
		
		after('remove local storage', () => {
			if (existsSync(tempTargetDir)) {
				rmdirsSync(tempTargetDir);
			}
		});
		
		return fn.apply(this, args);
	}
}
