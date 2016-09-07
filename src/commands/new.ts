import MyError from "../library/error";
import {requireConfigSetPath} from "../library/path";
import {requireCurrentConfigSet} from "../library/current";
import {newEnvironment} from "../actions/new-env";

export default function new_env(name, base = undefined) {
	if (!/^[a-zA-Z0-9\-_]+$/.test(name)) {
		console.error('env name must be /[a-zA-Z0-9\-_]+/');
		return false;
	}
	if (name === 'local' || name === 'default') {
		console.error(`you can't use %s as environment name`, name);
		return false;
	}
	
	const path = requireConfigSetPath(requireCurrentConfigSet());
	return newEnvironment(path, name, base);
}
