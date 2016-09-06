import {setCurrentConfigSet, getCurrentConfigSet} from "../actions/current-config";
import {getLocalConfigName} from "../actions/get-local-configset-name";
import {requireConfigSetPath} from "../library/path";

export default function set(configSetName) {
	if (configSetName) {
		if ('local' === configSetName) {
			configSetName = getLocalConfigName();
		}
		requireConfigSetPath(configSetName);
		return setCurrentConfigSet(configSetName);
	} else {
		if (getCurrentConfigSet()) {
			console.log(getCurrentConfigSet());
			return true;
		} else {
			console.log('no config set');
			return false;
		}
	}
}
