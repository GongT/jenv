import {configEnvExists} from "../actions/config-env-exists";
import MyError from "../library/error";
import new_env from "./new";
import {setCurrentDefault, getCurrentDefault} from "../actions/current-config";

export default function env(setValue) {
	if (setValue) {
		if (!configEnvExists(setValue)) {
			if (this.create) {
				new_env(setValue);
			} else {
				throw new MyError(`can't find env "${setValue}"`);
			}
		}
		return setCurrentDefault(setValue);
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
