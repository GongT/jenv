import {configEnvExists} from "../actions/config-env-exists";
import MyError from "../library/error";
import new_env from "./new";
import {setCurrentDefault, getCurrentDefault} from "../actions/current-config";

export default function env(envValue, base) {
	if (envValue) {
		if (!configEnvExists(envValue)) {
			if (this.create) {
				new_env(envValue, base);
			} else {
				throw new MyError(`can't find env "${envValue}"`);
			}
		}
		console.log('set default environment to %s', envValue);
		return setCurrentDefault(envValue);
	} else {
		if (getCurrentDefault()) {
			console.log(getCurrentDefault());
			return true;
		} else {
			console.log('no default');
			return false;
		}
	}
}
