#!/bin/sh
':' // ; exec "$(command -v nodejs || command -v node)" "$0" "$@" ; exit

try {
	if (require('os').platform() === 'darwin') {
		process.stdout['_handle'].setBlocking(true)
	}
} catch (e) {
}

require(require('path').resolve(__dirname, '../dist/bin'));
