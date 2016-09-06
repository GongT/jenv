import {resolve as pathResolve} from 'path';
import usage from './actions/usage';

module.exports = (command, args, options) => {
	let HandlerFunction;
	try {
		HandlerFunction = require(pathResolve(__dirname, `commands/${command}`)).default;
	} catch (e) {
		console.error(`unknown command "${command}"`);
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
