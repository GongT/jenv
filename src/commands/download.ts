import {} from "../library/path";
import {downloadRemote} from "../actions/download-remote";
import {requireConfigSetPath} from "../library/path";

export default function download(configSetName){
	return downloadRemote(requireConfigSetPath(configSetName));
}
