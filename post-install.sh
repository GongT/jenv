#!/usr/bin/env bash

[ -e "dist" ] && exit 0

set -x

if ! command -v "tsc" &>/dev/null ; then
	npm install --global typescript
fi

node -e "console.log(Object.keys(require('./package.json').devDependencies).filter(e => e.startsWith('@types/')).join('\n'))" | xargs npm install
tsc -p src
chmod a+x ./bin/jenv.js
rm -rf node_modules
