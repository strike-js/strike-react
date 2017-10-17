"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool_1 = require("./Pool");
var ManagedState_1 = require("./ManagedState");
/**
 * Returns value at a given key with in an object literal.
 *
 * @export
 * @param {object} object the object to use
 * @param {string} path the path to return its value
 * @param {string} p path separator, defaults to '.'
 * @returns {any} the value at the given key
 */
function getDataAt(object, path, p) {
    var o = object, key, temp, pathSep = p ? p : '.', list = path.split(pathSep);
    while ((key = list.shift()) && (temp = o[key]) && (o = temp))
        ;
    return temp;
}
exports.getDataAt = getDataAt;
/**
 * Creates a state container instance with the provided configurations
 * @param {StoreCfg} cfg the store configurations.
 * @returns {IStore}
 */
function createStore(cfg) {
    var components = {};
    var actions = {};
    var backlog = [];
    var middlewares = cfg.middlewares || [];
    var trackChanges = typeof cfg.trackChanges === "undefined" ? false : cfg.trackChanges;
    var o = null;
    var state = {};
    var pool = Pool_1.createPool(ManagedState_1.createManagedState);
    function connect(el) {
        var key = el.getStateKey();
        components[key] = el;
        state[key] = el.state || {};
        return o;
    }
    function disconnect(el) {
        delete components[el.getStateKey()];
        delete state[el.getStateKey()];
        return o;
    }
    function getStateAt(key) {
        return getDataAt(state, key, '.'); //state[key]; 
    }
    function setStateAt(key, val) {
        if (components[key]) {
            state[key] = val;
            components[key].setState(state[key]);
            return o;
        }
        throw new Error("Component with key " + key + " could not be found");
    }
    function applyMiddleware(action, done) {
        var idx = 0;
        var m = null;
        function next(action) {
            if (!action || idx >= middlewares.length) {
                return done(action);
            }
            m = middlewares[idx];
            idx++;
            return m(action, o, next);
        }
        next(action);
    }
    function doExecute(key, action) {
        var managedState = pool.get();
        var component = components[key];
        managedState.setState(state[key]);
        var rd = component.getReducer();
        if (rd) {
            rd(managedState, action);
            if (managedState.hasChanges()) {
                action.__executed = true;
                var changes = managedState.changes();
                component.setState(function () { return changes; }, function () {
                    action.__done && typeof action.__done === "function" && action.__done();
                });
            }
        }
        pool.put(managedState);
    }
    function execute(action) {
        if (action) {
            if (trackChanges) {
                backlog.push(action);
            }
            for (var key in components) {
                doExecute(key, action);
            }
            if (!action.__executed) {
                action.__done();
            }
        }
    }
    function onAction(action, cb) {
        action.__done = cb;
        action.__executed = false;
        if (!cb) {
            if (typeof Promise !== "undefined") {
                return new Promise(function (res) {
                    action.__done = res;
                    var act = applyMiddleware(action, function (finalAction) {
                        finalAction && execute(finalAction);
                    });
                });
            }
        }
        var act = applyMiddleware(action, function (finalAction) {
            finalAction && execute(finalAction);
        });
    }
    function onActionFail(err) {
        console.log(err, err.message, err.stack);
    }
    var dispatch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            throw new Error("No action provided");
        }
        else if (args.length === 1) {
            if (typeof args[0] === "function") {
                return args[0](dispatch, getStateAt);
            }
            else if (typeof args[0] === "object") {
                return onAction(args[0]);
            }
        }
        else if (args.length === 2) {
            if (typeof args[0] === "function") {
                return args[0](dispatch, getStateAt, args[1]);
            }
            else if (typeof args[0] === "object") {
                return onAction(args[0], args[1]);
            }
        }
    };
    o = {
        connect: connect,
        disconnect: disconnect,
        getStateAt: getStateAt,
        setStateAt: setStateAt,
        dispatch: dispatch
    };
    return o;
}
exports.createStore = createStore;
