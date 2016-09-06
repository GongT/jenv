const { use, expect, Assertion } = require('chai');
const { rmdirsSync } =require("nodejs-fs-utils");
const mkdirpSync = require("mkdirp").sync;
const { tmpdir } = require('os');
const { resolve } = require('path');
const { existsSync } = require('fs');
const command = require('./helpers').command;
const { registerPlugins } = require('./extends');

//noinspection JSAnnotator
const tempDir = global.tempDir = resolve(tmpdir(), 'jenv-test-' + Date.now());
const randomString1 = 'r' + parseInt(Math.random() * 10000).toString(16);
const randomString2 = 'r' + parseInt(Math.random() * 10000).toString(16);
const randomString3 = 'r' + parseInt(Math.random() * 10000).toString(16);
const randomString4 = 'r' + parseInt(Math.random() * 10000).toString(16);

use(registerPlugins);

before('init temp dir', () => {
	process.chdir(tmpdir());
	if (existsSync(tempDir)) {
		rmdirsSync(tempDir);
	}
});
after('cleanup temp dir', () => {
	process.chdir(tmpdir());
	if (existsSync(tempDir)) {
		rmdirsSync(tempDir);
	}
});

describe('print usage', function () {
	const usageSignature = /Usage: jenv \[command or options\]/;
	it('`jenv` should print usage', function () {
		command('jenv')
				.to.fail.and
				.stderr.to.match(usageSignature);
	});
	it('`jenv --help` should print usage', function () {
		command(['jenv', '--help'])
				.to.success.and
				.stdout.to.match(usageSignature);
	});
	it('`jenv --usage` should print usage', function () {
		command(['jenv', '--usage'])
				.to.success.and
				.stdout.to.match(usageSignature);
	});
});

describe('init and set remote', function () {
	
});

