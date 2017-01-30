import * as React from 'react';
import * as Immutable from 'immutable';
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
export class ControllerView extends React.Component {
    constructor(props, stateKey, initialState, reducer) {
        super(props);
        this.state = initialState;
        this.$$store = props.store;
        this.$$stateKey = stateKey;
        this.$$reducer = reducer;
        this.dispatch = this.$$store.dispatch;
    }
    /**
     * Returns the component's reducer function
     *
     * @returns the component's {Reducer}
     */
    getReducer() {
        return this.$$reducer;
    }
    /**
     * Returns the component's state key.
     *
     * @returns {string} the component's state key.
     */
    getStateKey() {
        return this.$$stateKey;
    }
    /**
     * To be called when the component is first mounted to connect the component to the application store.
     * Note: if this method is overriden in the child class, the child class must call `super.componentDidMount()`
     */
    componentDidMount() {
        this.$$store.connect(this);
        let props = this.props, stateKey = this.$$stateKey, strategy;
        if ((strategy = props.persistenceStrategy)) {
            strategy.get(stateKey)
                .then((em) => {
                if (em) {
                    this.$$store.replaceStateAt(stateKey, Immutable.Map(em));
                }
            });
        }
    }
    /**
     * To be called before the component is unmounted to disconnect the component from the application store.
     * Note: if this method is overriden in the child class, the child class must call `super.componentWillUnmount()`
     */
    componentWillUnmount() {
        let strategy = this.props.persistenceStrategy;
        if (strategy) {
            strategy.put(this.$$stateKey, this.state);
        }
        this.$$store.disconnect(this);
    }
}
