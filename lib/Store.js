"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool_1 = require("./Pool");
var ManagedState_1 = require("./ManagedState");
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
    var isReady = typeof cfg.ready === "undefined" ? true : cfg.ready;
    var trackChanges = typeof cfg.trackChanges === "undefined" ? false : cfg.trackChanges;
    var o = null;
    var queue = [];
    var pool = Pool_1.createPool(ManagedState_1.createManagedState);
    function connect(el) {
        components[el.getStateKey()] = el;
        return o;
    }
    function disconnect(el) {
        delete components[el.getStateKey()];
        return o;
    }
    function getStateAt(key) {
        return components[key].state;
    }
    function setStateAt(key, val) {
        if (components[key]) {
            components[key].setState(val);
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
    function execute(action) {
        if (action) {
            if (trackChanges) {
                backlog.push(action);
            }
            var managedState = pool.get();
            for (var key in components) {
                managedState.setState(components[key].state);
                var rd = components[key].getReducer();
                if (rd) {
                    rd(managedState, action);
                    if (managedState.hasChanges) {
                        components[key].setState(managedState.changes());
                    }
                }
            }
            pool.put(managedState);
        }
    }
    function ready() {
        isReady = true;
        var action = null;
        while ((action = queue.shift())) {
            dispatch.apply(null, action);
        }
    }
    function onAction(action) {
        var act = applyMiddleware(action, function (finalAction) {
            finalAction && execute(finalAction);
        });
    }
    function onActionFail(err) {
        console.log(err, err.message, err.stack);
    }
    function dispatch() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!isReady) {
            queue.push(Array.prototype.slice.call(args, 0));
            return;
        }
        if (args.length === 0) {
            throw new Error("No action provided");
        }
        else if (args.length === 1) {
            if (typeof args[0] === "function") {
                args[0](onAction);
            }
            else if (typeof args[0] === "object") {
                if (args[0].type) {
                    onAction(args[0]);
                }
                else if (args[0].then && typeof args[0].then === "function") {
                    args[0].then(onAction, onActionFail);
                }
            }
        }
        else if (args.length === 2) {
            if ((typeof args[0] === "string" ||
                typeof args[0] === "number") &&
                typeof args[1] !== "object") {
                onAction({
                    type: args[0],
                    data: args[1]
                });
            }
            else if (typeof args[0] === "string" &&
                typeof args[1] === "function") {
                var st = components[args[0]] && components[args[0]].state;
                var a = args[1](st, onAction);
                if (a && a.type) {
                    onAction(a);
                }
                else if (typeof a === "object" &&
                    typeof a.then === "function") {
                    a.then(onAction, onActionFail);
                }
            }
        }
    }
    o = {
        connect: connect,
        disconnect: disconnect,
        getStateAt: getStateAt,
        setStateAt: setStateAt,
        dispatch: dispatch,
        ready: ready,
    };
    return o;
}
exports.createStore = createStore;
