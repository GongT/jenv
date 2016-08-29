const usage = `Usage: jenv [command or options]

${t('example_run')}
  jenv [env_name] [command line]
  
${t('example')}
  jenv [-env] shell|bash|cmd         ${t('example_shell')}
  jenv -env npm start                ${t('example1')}
  jenv npm start                     ${t('example2')}

${t('example_local')}
  jenv --set new_name                ${t('example4')}
  jenv --pull git_url                ${t('example_pull')}
  jenv --pull --global git_url       ${t('example_pull_global')}
  jenv --get                         ${t('example5')}
  jenv --ls [env_name]               ${t('example6')}
  jenv --status                      ${t('example7')}
  jenv --default [env_name]          ${t('example3')}
  jenv --new [env_name]              ${t('env_create')}

xxxx:
  jenv --config [-env] name                 ${t('example_config_get')}
  jenv --config [-env] name value           ${t('example_config_set')}
  jenv --config [-env] --cached name value  ${t('example_config_set_cached')}

${t('example_global')}
  jenv --init new_name [git_url]      ${t('example8')}
  jenv --init --global new_name [git_url]       ${t('example9')}
  jenv --remote env_name [git_url]    ${t('example10')}
  jenv --upload [set_name]            ${t('git_upload')}
  jenv --download [set_name]          ${t('git_download')}
`;

console.error(usage);
process.exit(1);
