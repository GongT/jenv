# jenv
save config to git (as json) and set (some of) them as environment variables
保存、同步配置文件的工具    
用“json”格式保存、使用，用外部命令“git”同步数据

# install & usage 

由于使用git同步，PATH环境变量中必须能找到git

```bash
sudo npm -g install @gongt/jenv
jenv --help
```

# 配置文件示例
**目录结构**
<pre>
* .jsonenv/local/
|- environments.json
- *  .root/
  |-   default.json
  |-   production.json
- *  subdir1/
  - *  subdir1_1/
    |-   default.json
  |-   default.json
  |-   debug.json
- *  subdir2/
  |-   default.json
- *  .environment/
  |-   default.json
</pre>

### environments.json
```json
{
	"name": "the_setting_title",
	"environments": {
		"default": {
			"abstract": true,
			"inherits": false
		},
		"production": {
			"inherits": "default"
		},
		"debug": {
			"inherits": "default"
		}
	}
}
```

这将定义3套配置文件，分别名为“default”、“production”、“debug”。其中“production”和“debug”继承了default，可以理解为默认值默认值。继承可以嵌套，但不能多继承。

由于设置了abstract，默认（default）配置不允许直接使用，防止误用。

### 配置文件树中每一个目录：
每当发现一个目录时，会同时找到所有被继承的配置，并按继承关系生成最终结果。    
如果有3个配置文件，其中继承关系 C → B → A，有：    
> A.json: `{ "key": "value A", “A”: 1 }`
> B.json: `{ "key": "value B", "B": 2 }`
> C.json: `{ "key": "value C", "C": 3 }`
则：使用**B**配置时，得到的配置文件内容为：`{ "key": "value B", “A”: 1, "B": 2 }`      
使用**C**配置时，得到的配置文件内容为：`{ "key": "value C", “A”: 1, "B": 2, "C": 2 }`

### subdir1/、subdir1/subdir1_1/、subdir2/、....
配置文件正文，每个文件夹包含每个环境下的配置，但最终只产生一个配置文件（当前选择的那个环境的配置）

### .root/*.json
这个目录包含配置文件对象树的“根”对象，其他目录均添加在该对象上。

这个目录也可以有子目录，但最好不要这样

### .environment
这个目录的名称会转换成大写".ENVIRONMENT"，然后像普通文件夹一样附加在根对象上。

但还有一个特殊作用：这个文件夹生成的结果，只能是一个键值对对象，不能包含子对象、数组等高级数据类型（也就不能包含子文件夹）

它的结果会作为环境变量使用。

### 

# 用法
（详细说明参考 `jenv --help`）
### 初始化
下载一套新的配置：（不能和已有的重复）
```bash
jenv --pull git@git.github.com/GongT/my-config.git
```
下载新的到全局：
```bash
jenv --pull --global git@git.github.com/GongT/my-config.git
```

### 配置、环境操作
选择配置集：
```bash
jenv --set the_setting_title
```
选择环境：
```bash
jenv --env deploy
```
查看当前选择的环境、配置集状态：
```bash
jenv --status
```
查看当前配置文件内容：
```bash
jenv --show
```

### 下载和上传配置内容
下载新配置
```bash
jenv --download
```
上传修改过的配置
```bash
jenv --download
```
**注：**使用git上传，也就有可能出现冲突，jenv完全不能解决冲突，请使用其他工具。
