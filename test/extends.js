const { expect, Assertion, AssertionError } = require('chai');
const tempDir = global.tempDir;

module.exports.registerPlugins = function (_chai, utils) {
	Assertion.addProperty('success', success);
	Assertion.addProperty('fail', fail);
	Assertion.addProperty('output', output);
	Assertion.addProperty('stderr', stderr);
	Assertion.addProperty('stdout', stdout);
	Assertion.addProperty('isCommand', isCommand);
	
	['match', 'have.string', 'equal'].forEach(function wrapCommandAssert(name) {
		name = name.split(/\./g);
		const readName = name.join(' ');
		name = name.pop();
		
		utils.overwriteMethod(Assertion.prototype, name, function (_super) {
			return function (...args) {
				if (utils.flag(this, 'isCommand') && utils.flag(this, 'command type')) {
					try {
						_super.apply(this, args);
					} catch (e) {
						const type = utils.flag(this, 'command type');
						// const cmdline = utils.flag(this, 'command line');
						
						const message = `expected ${type} ${readName} ${args[0]}`;
						throw new AssertionError(message);
					}
				} else {
					_super.apply(this, args);
				}
			}
		});
	});
	
	function isCommand() {
		utils.flag(this, 'isCommand', true);
		utils.flag(this, 'command line', utils.flag(this, 'object').command);
	}
	
	function fail() {
		const obj = utils.flag(this, 'object');
		expect(obj.status).to.not.equal(0, `command "${obj.command}" NOT failed`);
	}
	
	function success() {
		const obj = utils.flag(this, 'object');
		expect(obj.status).to.equal(0, `command "${obj.command}" NOT success`);
	}
	
	function output() {
		const obj = utils.flag(this, 'object');
		const buffer = Buffer.concat(obj.output).toString('utf-8');
		utils.flag(this, 'object', buffer);
		utils.flag(this, 'command type', 'output');
	}
	
	function stderr() {
		const obj = utils.flag(this, 'object');
		const buffer = obj.stderr.toString('utf-8');
		utils.flag(this, 'object', buffer);
		utils.flag(this, 'command type', 'stderr');
	}
	
	function stdout() {
		const obj = utils.flag(this, 'object');
		const buffer = obj.stdout.toString('utf-8');
		utils.flag(this, 'object', buffer);
		utils.flag(this, 'command type', 'stdout');
	}
};
