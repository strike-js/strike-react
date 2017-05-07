"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates an object pool to help with object reuse.
 * This is to optimise garabage collection in JS application.
 * @param {function} make an object generator function. If provided, the function will be called when no the pool is empty.
 * @returns {Pool}
 */
function createPool(make) {
    var pool = [];
    function get(d) {
        if (pool.length === 0) {
            var v = (make && make(d)) || {};
            return v;
        }
        return pool.shift();
    }
    function put(o) {
        pool.push(o);
    }
    return {
        get: get,
        put: put,
    };
}
exports.createPool = createPool;
