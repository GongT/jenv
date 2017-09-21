///<reference types="node"/>
var isServer = typeof process === 'object';
var isDebug = isServer ? process.env.NODE_ENV !== 'production' : true;
var data, cache;
function window_loader() {
    return window.__JsonEnv;
}
function fs_loader() {
    var configFilePath = process.env.CONFIG_FILE || process.env.JENV_FILE_NAME;
    if (!configFilePath) {
        throw new Error("please set environment \"CONFIG_FILE\" or \"JENV_FILE_NAME\".");
    }
    if (cache === configFilePath) {
        return data;
    }
    if (isDebug) {
        console.log("load config from " + configFilePath);
    }
    if (!require('fs').existsSync(configFilePath)) {
        throw new Error("config file " + configFilePath + " not exists.");
    }
    cache = configFilePath;
    return data = require(configFilePath);
}
var loader = isServer ? fs_loader : window_loader;
module.exports = loader;
module.exports.load = loader;
Object.defineProperty(module.exports, 'JsonEnv', {
    get: loader,
    configurable: false,
    enumerable: true
});
Object.defineProperty(module.exports, "__esModule", { value: true });
//# sourceMappingURL=require.js.map