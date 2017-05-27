"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
function createControllerView(_a) {
    var component = _a.component, reducer = _a.reducer, initialState = _a.initialState, deps = _a.deps, propsModifier = _a.propsModifier, propsToPropagate = _a.propsToPropagate, stateKey = _a.stateKey;
    var store = null;
    var injector = null;
    var propsObject = {
        data: null,
        store: null,
        dispatch: null
    };
    return (function (_super) {
        __extends(class_1, _super);
        function class_1(props) {
            var _this = _super.call(this, props) || this;
            _this.state = initialState;
            store = props.store;
            injector = props.injector;
            propsObject.store = props.store;
            propsObject.dispatch = store.dispatch;
            _this.propagateProps(props);
            if (deps) {
                if (deps instanceof Array) {
                    deps.forEach(function (e) {
                        propsObject[e] = injector.get(e);
                    });
                }
                else if (typeof deps === "object") {
                    for (var kk in deps) {
                        propsObject[deps[kk]] = injector.get(kk);
                    }
                }
            }
            return _this;
        }
        class_1.prototype.propagateProps = function (props) {
            if (propsToPropagate &&
                propsToPropagate instanceof Array) {
                propsToPropagate.forEach(function (e) {
                    propsObject[e] = props[e];
                });
            }
            if (propsModifier &&
                typeof propsModifier === "function") {
                propsModifier(props, propsObject);
            }
            propsObject.dispatch = store.dispatch;
            propsObject.routeParams = props.routeParams;
        };
        class_1.prototype.getStateKey = function () {
            return stateKey;
        };
        class_1.prototype.getReducer = function () {
            return reducer;
        };
        class_1.prototype.componentWillReceiveProps = function (props) {
            this.propagateProps(props);
        };
        class_1.prototype.componentDidMount = function () {
            var _this = this;
            store.connect(this);
            var persistenceStrategy = this.props.persistenceStrategy;
            if (persistenceStrategy) {
                if (typeof persistenceStrategy === "function") {
                    persistenceStrategy(stateKey, function (err, data) {
                        if (err) {
                            console.error(err.message, err.stack);
                            return;
                        }
                        _this.setState(data);
                    });
                }
                else if (typeof persistenceStrategy === "object") {
                    var persist = persistenceStrategy;
                    if (typeof persist.get === "function") {
                        if (persist.get.length === 2) {
                            persist.get(stateKey, function (err, data) {
                                if (err) {
                                    throw err;
                                }
                                _this.setState(data);
                            });
                        }
                        else if (persist.get.length === 1) {
                            return persist.get(stateKey).then(function (data) {
                                _this.setState(data);
                            }, function (err) {
                                console.log(err);
                            });
                        }
                    }
                }
            }
        };
        class_1.prototype.componentWillUnmount = function () {
            var _this = this;
            var state = this.state;
            var persistenceStrategy = this.props.persistenceStrategy;
            if (typeof persistenceStrategy === "function") {
                persistenceStrategy(stateKey, state, function (err, data) {
                    store.disconnect(_this);
                    if (err) {
                        throw err;
                    }
                });
                return;
            }
            else if (typeof persistenceStrategy === "object" &&
                persistenceStrategy.get !== "undefined") {
                var p = persistenceStrategy;
                if (p.put.length === 2) {
                    p.put(stateKey, state).then(function (data) {
                        store.disconnect(_this);
                    }, function (err) {
                        console.log(err);
                    });
                    return;
                }
                else if (p.put.length === 3) {
                    p.put(stateKey, state, function (err, data) {
                        store.disconnect(_this);
                        if (err) {
                            throw err;
                        }
                    });
                    return;
                }
            }
            store.disconnect(this);
        };
        class_1.prototype.render = function () {
            propsObject.data = this.state;
            return React.createElement(component, propsObject, this.props.children);
        };
        return class_1;
    }(React.Component));
}
exports.createControllerView = createControllerView;
