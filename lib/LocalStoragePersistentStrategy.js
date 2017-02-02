"use strict";
function localStorageStrategy() {
    function get(key) {
        return new Promise(function (resolve, reject) {
            var v = localStorage.getItem(key);
            if (v) {
                resolve(JSON.parse(v));
                return;
            }
            reject();
        });
    }
    function put(key, data) {
        return new Promise(function (resolve, reject) {
            localStorage.setItem(key, JSON.stringify(data));
            resolve();
        });
    }
    return {
        get: get,
        put: put
    };
}
exports.localStorageStrategy = localStorageStrategy;
