import {resolve as pathResolve} from 'path';
import usage from './actions/usage';

module.exports = (command, args, options) => {
	const commandFile = pathResolve(__dirname, `commands/${command}`);
	let HandlerFunction;
	try {
		HandlerFunction = require(commandFile).default;
	} catch (e) {
		console.error(`unknown command "${command}"`);
		console.error(`\t${e.message}`);
		throw usage();
	}
	const ret = HandlerFunction.apply(options, args);
	if (ret === true || ret === undefined) {
		return 0;
	} else if (ret === false) {
		return 1;
	} else {
		return ret;
	}
};
