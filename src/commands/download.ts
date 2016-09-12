import {downloadRemote} from "../actions/download-remote";
import {requireConfigSetPath} from "../library/path";

export default function download(this:CmdLineConfig, configSetName){
	return downloadRemote(requireConfigSetPath(configSetName));
}
