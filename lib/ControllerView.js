"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Immutable = require("immutable");
/**
 * A {ControllerView} is a ReactJS component that manages a specific space of the application state.
 * It is responsible for passing that part of the application state to other stateless/stateful components.
 * All components that requires access to the application state store must extends this class.
 *
 * @export
 * @class ControllerView
 * @extends {Component<T, V>}
 * @template T any object that extends/implements {ControllerViewProps}
 * @template V
 */
var ControllerView = (function (_super) {
    __extends(ControllerView, _super);
    function ControllerView(props) {
        var _this = _super.call(this, props) || this;
        var store = props.store, reducer = props.reducer, stateKey = props.stateKey, initialState = props.initialState;
        _this.state = initialState;
        _this.$$store = props.store;
        _this.$$stateKey = stateKey;
        _this.$$reducer = reducer;
        _this.dispatch = store.dispatch;
        return _this;
    }
    /**
     * Returns the component's reducer function
     *
     * @returns the component's {Reducer}
     */
    ControllerView.prototype.getReducer = function () {
        return this.$$reducer;
    };
    /**
     * Returns the component's state key.
     *
     * @returns {string} the component's state key.
     */
    ControllerView.prototype.getStateKey = function () {
        return this.$$stateKey;
    };
    /**
     * To be called when the component is first mounted to connect the component to the application store.
     * Note: if this method is overriden in the child class, the child class must call `super.componentDidMount()`
     */
    ControllerView.prototype.componentDidMount = function () {
        var _this = this;
        this.$$store.connect(this);
        var props = this.props, stateKey = this.$$stateKey, strategy;
        if ((strategy = props.persistenceStrategy)) {
            strategy.get(stateKey)
                .then(function (em) {
                if (em) {
                    _this.$$store.replaceStateAt(stateKey, Immutable.Map(em));
                }
            });
        }
    };
    /**
     * To be called before the component is unmounted to disconnect the component from the application store.
     * Note: if this method is overriden in the child class, the child class must call `super.componentWillUnmount()`
     */
    ControllerView.prototype.componentWillUnmount = function () {
        var strategy = this.props.persistenceStrategy;
        if (strategy) {
            strategy.put(this.$$stateKey, this.state);
        }
        this.$$store.disconnect(this);
    };
    ControllerView.prototype.render = function () {
        return this.props.children(this.state);
    };
    return ControllerView;
}(React.Component));
exports.ControllerView = ControllerView;
