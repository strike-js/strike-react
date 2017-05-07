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
            _hasChanges = true;
        }
        return o;
    }
    function $get(key) {
        return state[key];
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
        $get: $get,
        hasChanges: hasChanges,
        changes: changes
    };
    return o;
}
exports.createManagedState = createManagedState;
