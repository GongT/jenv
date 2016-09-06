import {getCurrentDefault, getCurrentConfigSet} from "../actions/current-config";
import {getAllEnv} from "../actions/get-all-env";
import {requireConfigSetPath} from "../library/path";
import {gitremote} from "../library/git";

export default function status() {
	const env = getCurrentDefault();
	const set = getCurrentConfigSet();
	const setPath = set ? requireConfigSetPath(set) : null;
	const envList: string[] = set ? getAllEnv(set) : [];
	
	console.log(`
${t('current_set')}${set || t('not_set')}
${t('current_env')}${env || t('not_set')}
${t('configset_save_path')}${setPath || t('not_set')}
${t('configset_git_url')}${setPath ? try_gitremote(setPath) : t('not_set')}

${t('available_env')}
  ${envList.length ? envList.join('\n  ') : t('zero_length')}
`)
}

function try_gitremote(setPath) {
	try {
		return gitremote(setPath);
	} catch (e) {
		return t('not_set') + ' ('+t('how_to_set_git')+')';
	}
}
