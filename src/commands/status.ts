import {getCurrentDefault, getCurrentConfigSet} from "../actions/current-config";
import {getAllEnv} from "../actions/get-all-env";
import {requireConfigSetPath} from "../library/path";
import {gitremote} from "../library/git";
import {getLocalConfigName} from "../actions/get-local-configset-name";

export default function status(this: CmdLineConfig) {
	const env = getCurrentDefault() || null;
	const set = getCurrentConfigSet() || null;
	const setPath = set ? requireConfigSetPath(set) : null;
	const envList: string[] = set ? getAllEnv(set) : [];
	
	const gitUrl = setPath ? try_gitremote(setPath) : null;
	
	if (this.json) {
		const data = {
			env,
			set,
			setPath,
			envList,
			gitUrl,
			local: getLocalConfigName(),
		};
		console.log(JSON.stringify(data));
		return;
	}
	
	console.log(`
${t('current_set')}${set || t('not_set')}
${t('current_env')}${env || t('not_set')}
${t('configset_save_path')}${setPath || t('not_set')}
${t('configset_git_url')}${gitUrl || t('not_set')}

${t('available_env')}
  ${envList.length ? envList.join('\n  ') : t('zero_length')}
`)
}

function try_gitremote(setPath) {
	try {
		return gitremote(setPath);
	} catch (e) {
		return t('not_set') + ' (' + t('how_to_set_git') + ')';
	}
}
