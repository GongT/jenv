const { readFileSync } = require('fs');
const { expect, Assertion, AssertionError } = require('chai');
const tempDir = global.tempDir;
const { isFile, isDirectory, isSymbolicLink, readJson } = require('./helpers');

module.exports.registerPlugins = function (_chai, utils) {
	Assertion.addSameEffectChainableMethod = function (name, func) {
		function fb() {
			utils.flag(this, 'last chain', name);
			func.apply(this, arguments);
			return this;
		}
		
		return Assertion.addChainableMethod(name, fb, fb);
	};
	
	Assertion.addSameEffectChainableMethod('success', success);
	Assertion.addSameEffectChainableMethod('fail', fail);
	Assertion.addProperty('output', output);
	Assertion.addProperty('stderr', stderr);
	Assertion.addProperty('stdout', stdout);
	Assertion.addProperty('content', content);
	Assertion.addProperty('jsonObject', jsonObject);
	Assertion.addMethod('value', value);
	Assertion.addProperty('isCommand', isCommand);
	
	Assertion.addProperty('will', () => undefined);
	
	Assertion.addSameEffectChainableMethod('file', wrapTester(isFile, 'not exists or not a file'));
	Assertion.addSameEffectChainableMethod('directory', wrapTester(isDirectory, 'not exists or not a directory'));
	Assertion.addSameEffectChainableMethod('symbolicLink', wrapTester(isSymbolicLink, 'not exists or not a symbolicLink'));
	
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
						const object = utils.flag(this, 'object');
						// const cmdline = utils.flag(this, 'command line');
						
						const message = `expected ${type} ${readName} "${args[0]}`;
						const err = new AssertionError(message);
						throw wrap_output(err, object)
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
		try {
			expect(obj.status).to.not.equal(0, `command "${obj.command}" NOT failed`);
		} catch (e) {
			throw wrap_output(e, obj);
		}
	}
	
	function success() {
		const obj = utils.flag(this, 'object');
		try {
			expect(obj.status).to.equal(0, `command "${obj.command}" NOT success`);
		} catch (e) {
			throw wrap_output(e, obj);
		}
	}
	
	function output() {
		const obj = utils.flag(this, 'object');
		const buffer = Buffer.concat(obj.output.filter(x => !!x)).toString('utf-8');
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
	
	function value() {
		return utils.flag(this, 'object');
	}
	
	function content() {
		const last = utils.flag(this, 'last chain');
		const val = utils.flag(this, 'object');
		
		let ret;
		if (last === 'file') {
			if (/\.json$/.test(val)) {
				ret = readJson(val);
			} else {
				ret = readFileSync(val, 'utf-8');
			}
		} else if (last === 'directory') {
			ret = readdirSync(val);
		} else {
			throw new Error('wrong usage or .content');
		}
		utils.flag(this, 'object', ret);
	}
	
	function jsonObject() {
		const val = utils.flag(this, 'object');
		try {
			utils.flag(this, 'object', JSON.parse(val.trim()));
		} catch (e) {
			throw new AssertionError(`can't parse json - ${e.message}:\n\t${val}`);
		}
	}
	
	function wrapTester(tester, msg) {
		return function () {
			const obj = utils.flag(this, 'object');
			if (!tester(obj)) {
				throw new AssertionError(obj + ': ' + msg);
			}
		};
	}
};

function tab(str) {
	return '\t' + str.replace(/\n/g, '\n\t');
}
function wrap_output(err, object) {
	if (typeof object !== 'string') {
		object = Buffer.concat(object.output.filter(x => !!x)).toString('utf-8');
	}
	const message = `, output is:\n============\n${tab(object)}\n============`;
	
	const newErr = new AssertionError(err.message);
	
	newErr.stack = err.stack;
	newErr.message += message;
	
	return newErr;
}
