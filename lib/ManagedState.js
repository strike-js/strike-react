"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a managed state object
 * @param {any} s the initial state to manage
 * @returns {IManagedState}
 */
function createManagedState(s) {
    var state = s || null;
    var _changes = {};
    var o;
    var _hasChanges = false;
    function $set(key, val) {
        if (state[key] !== val) {
            _changes[key] = val;
            state[key] = val;
            _hasChanges = true;
        }
        return o;
    }
    function $get(key) {
        return state[key];
    }
    function $push(key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var data = state[key];
        if (data && data.push && data.slice) {
            var v = data.slice(0);
            v.push.apply(v, args);
            $set(key, v);
        }
        return o;
    }
    function withMutations(cb) {
        cb(o);
    }
    function $splice(key, index, count) {
        if (count === void 0) { count = 1; }
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var data = state[key];
        if (data && data.splice && data.slice) {
            var v = data.slice(0);
            v.splice.apply(v, [index, count].concat(args));
            $set(key, v);
        }
        return o;
    }
    function $shift(key) {
        var data = state[key];
        if (data && data.shift && data.slice) {
            var v = data.slice(0);
            var temp = v.shift();
            $set(key, v);
            return temp;
        }
        return;
    }
    function $unshift(key, val) {
        var data = state[key];
        if (data && data.unshift && data.slice) {
            var v = data.slice(0);
            v.unshift(val);
            $set(key, v);
        }
        return o;
    }
    function $pop(key) {
        var data = state[key];
        if (data && data.pop && data.slice) {
            var v = data.slice(0);
            var temp = v.pop();
            $set(key, v);
            return temp;
        }
        return;
    }
    function setState(st) {
        _hasChanges = false;
        _changes = {};
        state = st;
        return o;
    }
    function hasChanges() {
        return _hasChanges;
    }
    function changes() {
        return _changes;
    }
    o = {
        setState: setState,
        $set: $set,
        $push: $push,
        $splice: $splice,
        $pop: $pop,
        $shift: $shift,
        $unshift: $unshift,
        $get: $get,
        withMutations: withMutations,
        hasChanges: hasChanges,
        changes: changes
    };
    return o;
}
exports.createManagedState = createManagedState;
