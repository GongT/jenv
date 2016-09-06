import MyError from "../library/error";
export default function usage(success = false) {
	const usageStr = `Usage: jenv [command or options]

${t('usage_base')}
  jenv [env_name] [command line]
  
${t('usage_exec')}
  jenv [-env] shell|bash|cmd          ${t('usage_shell')}
  jenv npm start                      ${t('usage_run_default')}
  jenv -env npm start                 ${t('usage_run_with')}

${t('usage_local')}
  jenv --set [new_name]               ${t('usage_config_set')}
  jenv --env [env_name]               ${t('usage_config_default')}
  jenv --ls                           ${t('usage_ls')}
  jenv --status                       ${t('usage_status')}
  jenv --new env_name base_env        ${t('usage_create_env')}

${t('usage_config')}
  jenv --config [-env] name                 ${t('usage_get')}
  jenv --config [-env] name value           ${t('usage_set')}
  jenv --remote env_name [git_url]    ${t('usage_config_set_remote')}
  jenv --upload [set_name]            ${t('usage_git_upload')}
  jenv --download [set_name]          ${t('usage_git_download')}

${t('usage_global')}
  jenv --pull [--global] git_url      ${t('usage_git_pull')}
  jenv --init [--global] new_name [git_url]     ${t('usage_create_set')}
`;
	
	if (success) {
		console.log(usageStr);
	} else {
		console.error(usageStr);
		process.exit(1);
	}
};
