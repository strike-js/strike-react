"use strict";
function localStorageStrategy() {
    function get(key) {
        return new Promise(function (resolve, rejct) {
            var v = localStorage.getItem(key);
            return v && JSON.parse(v);
        });
    }
    function put(key, data) {
        return new Promise(function (resolve, reject) {
            localStorage.setItem(key, JSON.stringify(data));
        });
    }
    return {
        get: get,
        put: put
    };
}
exports.localStorageStrategy = localStorageStrategy;
