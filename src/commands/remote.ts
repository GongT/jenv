import MyError from "../library/error";
import {setRemote} from "../actions/set-remote";
import {requireConfigSetPath} from "../library/path";
import {getCurrentConfigSet} from "../actions/current-config";

export default function remote(this:CmdLineConfig, remoteUrl) {
	if(!remoteUrl){
		console.error('remote-url is required');
		return false;
	}
	return setRemote(requireConfigSetPath(getCurrentConfigSet()), remoteUrl);
}
