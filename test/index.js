const { resolve } = require('path');
const { use, expect, Assertion } = require('chai');

const systemTempDir = '/tmp';
const tempDir = global.tempDir = resolve(systemTempDir, 'jenv-test-' + Date.now());

const {
		      command,
		      emptyStore,
		      emptyTempFolder,
		      random,
		      localStorePath,
		      globalStorePath,
		      writeJson,
		      testEnvConfig,
		      writeEnvConfig,
      } = require('./helpers');
const { registerPlugins } = require('./extends');
const { describe, describeStorage } = require('./describe');

//noinspection JSAnnotator
const usageSignature = /Usage: jenv \[command or options\]/;
const notAvailableStore = resolve(__dirname, '../.git');

use(registerPlugins);

describe('print usage', function () {
	it('`jenv` should print usage', function () {
		command('jenv')
				.will.fail.and
				.stderr.match(usageSignature);
	});
	it('`jenv --help` should print usage', function () {
		command(['jenv', '--help'])
				.will.success.and
				.stdout.match(usageSignature);
	});
	it('`jenv --usage` should print usage', function () {
		command(['jenv', '--usage'])
				.will.success.and
				.stdout.match(usageSignature);
	});
});

describe('init new storage', function () {
	const configsetName = random();
	
	it('`jenv --init` should fail and print usage', function () {
		command(['jenv', '--init'])
				.will.fail.and
				.stderr.match(usageSignature);
	});
	
	it('`jenv --init ' + configsetName + '` should success', function () {
		command(['jenv', '--init', configsetName]).will.success();
	});
	
	it('should have file environments.json and well format', function () {
		expect(localStorePath('environments.json')).to.be.a.file().and
				.content.to.have.property('name', configsetName);
		expect(localStorePath('environments.json')).to.be.a.file().and
				.content.to.have.deep.property('environments.default.inherits', false);
	});
	it('should have file .root/default.json', function () {
		expect(localStorePath('.root/default.json')).to.be.a.file().and
				.content.to.be.an('object');
	});
	it('should have file .environment/default.json', function () {
		expect(localStorePath('.environment/default.json')).to.be.a.file().and
				.content.to.be.an('object');
	});
	
	const randomString2 = random();
	it('`jenv --init ' + randomString2 + '` should fail becouse `is already exists`', function () {
		command(['jenv', '--init', configsetName]).will.fail.and
				.stderr.to.have.string('is already exists');
	});
	
});

describeStorage('set storage remote', function () {
	it('`jenv --status` should success without remote', function () {
		command(['jenv', '--status']).will.success();
	});
	
	it('`jenv --remote` should fail becouse `is required`', function () {
		command(['jenv', '--remote']).will.fail.and
				.stderr.to.have.string('is required');
	});
	it('`jenv --remote notAvailableStore` should fail becouse `[rejected]`', function () {
		command(['jenv', '--remote', notAvailableStore]).will.fail.and
				.stderr.to.have.string('[rejected]');
	});
	it('`jenv --remote none-exists-url` should fail becouse `[rejected]`', function () {
		command(['jenv', '--remote', '/none-exists-url']).will.fail();
	});
	
	it('`jenv --remote emptyStore` should success and `branch track success`', function () {
		command(['jenv', '--remote', emptyStore()]).will.success.and
				.stdout.to.have.string('Branch jsonenv set up to track remote branch jsonenv');
	});
});

describeStorage('change project setting', function () {
	it('can set project configset', function () {
		command(['jenv', '--set', 'local']).will.success.and
				.stdout.to.have.string('set current configset to');
	});
	it('can print project configset name', function () {
		command(['jenv', '--set', 'local']).will.success.and
				.stdout.to.have.string('set current configset to');
	});
	
	it('can set project default envrionment', function () {
		command(['jenv', '--env', 'default']).will.success.and
				.stdout.to.have.string('set default environment to');
	});
	it('can print project default environment name', function () {
		command(['jenv', '--set', 'local']).will.success.and
				.stdout.to.have.string('set current configset to');
	});
	
	it('can\'t set default envrionment to none exists', function () {
		command(['jenv', '--env', 'none-exists']).will.fail();
	});
	
	it('project default environment name won\'t change', function () {
		command(['jenv', '--set', 'local']).will.success.and
				.stdout.to.have.string('set current configset to');
	});
});

describeStorage('print project configfile', function () {
	before('set something to `default` env', function () {
		command(['jenv', '--env', 'default']).will.success.and
				.stdout.to.have.string('set default environment to');
		writeEnvConfig('default', 1, 2);
	});
	
	let defaultConfig;
	it(`can print configfile from "default"`, function () {
		defaultConfig = command(['jenv', '--show']).will.success().and
				.stdout.to.be.a.jsonObject.value();
		testEnvConfig(defaultConfig, 1, 2);
	});
	
	const randomEnv1 = random();
	const randomEnv2 = random();
	it('can create envrionment based on default', function () {
		command(['jenv', '--new', randomEnv1, 'default']).will.success();
	});
	it('can create envrionment', function () {
		command(['jenv', '--new', randomEnv2]).will.success();
		writeEnvConfig(randomEnv2, 'a', 'b');
	});
	
	it(`can print configfile from "${randomEnv1}" same as default`, function () {
		const subConfig1 = command(['jenv', '--show', randomEnv1]).will.success.and
				.stdout.to.be.a.jsonObject.value();
		testEnvConfig(subConfig1, 1, 2);
	});
	it(`can print configfile from "${randomEnv2}"`, function () {
		const subConfig2 = command(['jenv', '--show', randomEnv2]).will.success.and
				.stdout.to.be.a.jsonObject.value();
		testEnvConfig(subConfig2, 'a', 'b');
	});
});

describeStorage('run external command', function () {
	before('set something to `default` env', function () {
		command(['jenv', '--env', 'default']).will.success.and
				.stdout.to.have.string('set default environment to');
		writeEnvConfig('default', 1, 2);
	});
	
	let filePath;
	it(`can read env from children program`, function () {
		const envList = command(['jenv', '/bin/env']).will.success.and
				.stdout.value();
		expect(envList).to.have.string('VALUE_ENV=2');
		expect(envList).to.have.string('JENV_FILE_NAME=/');
		expect(envList).to.have.string('JENV_FILE_NAME_REL=./');
		
		filePath = /^JENV_FILE_NAME=(.+)$/m.exec(envList)[1];
	});
	
	it(`can read json from JENV_FILE_NAME`, function () {
		const data = expect(filePath).to.be.a.file().and
				.content.to.be.an('object').value();
		
		testEnvConfig(data, 1, 2);
	});
});

describeStorage('upload and download and pull', function () {
	let store, otherDir;
	
	before('set something to `default` env and upload', function () {
		store = emptyStore();
		
		command(['jenv', '--env', 'default']).will.success.and
				.stdout.to.have.string('set default environment to');
		
		command(['jenv', '--remote', store]).will.success.and
				.stdout.to.have.string('Branch jsonenv set up to track remote branch jsonenv');
	});
	
	it(`can upload`, function () {
		writeEnvConfig('default', 1, 2);
		command(['jenv', '--upload']).will.success();
	});
	
	it(`can pull`, function () {
		otherDir = emptyTempFolder();
		
		command(['jenv', '--pull', store], { cwd: otherDir }).will.success();
		
		const data = command(['jenv', '--show', 'default'], { cwd: otherDir }).will.success().and
				.stdout.to.be.a.jsonObject.value();
		
		testEnvConfig(data, 1, 2);
		
		writeEnvConfig('default', 'a', 'b');
		command(['jenv', '--upload']).will.success();
	});
	
	it('can download', function () {
		command(['jenv', '--download']).will.success();
		
		const data = command(['jenv', '--show']).will.success().and
				.stdout.to.be.a.jsonObject.value();
		
		testEnvConfig(data, 'a', 'b');
	});
});
