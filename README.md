# json-env-cli
save config to git (as json) and set (some of) them as environment variables

# install & usage 

*git* must be installed and placed in $PATH (or %PATH%)

```bash
sudo npm -g install jenv
jenv --help
```

# config file structure

<pre>
* .jsonenv/local/
|-   dev.json
|-   us.json
|-   cn.json
|-   GongT.json
 \*  passport/
  |-   default.json
  |-   dev.json
  |-   us.json
  |-   cn.json
</pre>

if env is **GongT** then passport/default.json will load.

but if env is **dev** then passport/default.json will not load.

if env is **blabla** then there is a fatal error

### example config file:
cn.json:
```json
{
	"DebugMode": false,
	"lang": "zh-cn.UTF-8",
	"database": { "host": "127.0.0.1", "port": 3306 },
	"country_code": "cn"
}
```
passport/cn.json:
```json
{
	"weibo": {
		"clientID": "",
		"clientSecret": "",
		"callbackURL": "http://cn.example.com/auth/weibo/callback"
	}
}
```
result:

* show current default config json with `# jenv -ls`:
```json
{
	"DebugMode": false,
	"lang": "zh-cn.UTF-8",
	"database": { "host": "127.0.0.1", "port": 3306 },
	"country_code": "cn",
	"passport":{
		"weibo": {
			"clientID": "",
			"clientSecret": "",
			"callbackURL": "http://cn.example.com/auth/weibo/callback"
		}
	},
	"JENV_FILE_NAME": "/tmp/92f81476eab00dfe8661d34a4bdf6013.json"
}
```

* try to run a program `# jenv /usr/bin/env`:
```
HOME=/home/GongT
USER=GongT
.... normal env lines ...
LANG=zh-cn.UTF-8
DEBUG_MODE=
COUNTRY_CODE=cn
JENV_FILE_NAME=/tmp/92f81476eab00dfe8661d34a4bdf6013.json
```
there is no complex field export as env vars.

* run ls with current env `# jenv /usr/bin/ls`:
```
总用量 48
drwxr-xr-x.   3 GongT GongT  4096 7月  20 15:53 bin
```

* run ls with another env (temporary) `# jenv -en /usr/bin/ls`:
```
total 48
drwxr-xr-x.   3 GongT GongT  4096 Jul 20 15:53 bin
```

# examples

#### init settings storage
```bash
[root@localhost /data/my-project1]# jenv --init my-config git@git.github.com/GongT/my-config.git
[root@localhost /data/my-project1]# jenv --default dev
## now edit config file (dev.json) with editor
[root@localhost /data/my-project1]# jenv npm start
```

#### download & upload & pull
```bash
# pull - init and download
[root@localhost /data/my-project1]# jenv --pull git@git.github.com/GongT/my-config.git
# download (!! reset any local change !!)
[root@localhost /data/my-project1]# jenv --download
# upload (may have conflict, need manual resolve with git)
[root@localhost /data/my-project1]# jenv --upload
```


#### share with other projects
```bash
[root@localhost /data/my-project2]# jenv --pull git@git.github.com/GongT/my-config.git
[root@localhost /data/my-project2]# jenv --default dev
[root@localhost /data/my-project2]# jenv python ./start.py
```

#### use in another project
```bash
[root@localhost /data/business-project]# jenv --pull git@git.github.com/group/private-config.git
[root@localhost /data/business-project]# jenv --default dev
[root@localhost /data/business-project]# jenv ./start.sh
```

#### use in different server
```bash
[root@server1 /data/business-project]# jenv --pull git@git.github.com/group/private-config.git
[root@server1 /data/business-project]# jenv --default china-server-config
[root@server1 /data/business-project]# jenv docker build

[root@server2 /data/business-project]# jenv --pull git@git.github.com/group/private-config.git
[root@server2 /data/business-project]# jenv --default us-west-server-config
[root@server2 /data/business-project]# jenv docker build
```

#### pass env to docker container with Dockerfile at build time
```Dockerfile
# build: jenv docker build .
FROM php@fpm-alpine

COPY . /usr/src/myapp
COPY ${JENV_FILE_NAME} /usr/src/myapp/config.json
ENV CONFIG_FILE /usr/src/myapp/config.json

EXPOSE 9000
```

