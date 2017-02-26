declare module "strikejs-react" {

    import * as React from 'react';
    import {Dictionary} from 'strikejs-util';
    import * as Immutable from 'immutable'; 
    import * as Promise from 'bluebird'; 
    /**
     * Represents an action triggered with-in the application.
     * 
     * @export
     * @interface Action
     */
    export interface Action{
        /**
         * Uniquely identifies the action across the application. 
         * 
         * @type {(string|number)}
         */
        type:string|number;
        /**
         * Any data attached to the action. Action data should only include data primitives i.e. number, string, boolean. 
         * 
         * @type {*}
         */
        data?:any;
        /**
         * 
         * 
         * @type {string}
         * @memberOf Action
         */
        app?:string; 
    }

    /**
     * Represents an action generating a promise. This type of actions are supposed to be caught using {Promisify} middleware. 
     * 
     * @export
     * @interface PromiseAction
     * @extends {Action}
     * @template T
     */
    export interface PromiseAction<T> extends Action{
        /**
         * A promise to be caught by the {Promisify} middleware. 
         * 
         * @type {Promise<T>}
         */
        promise: Promise<T>;
    } 

    /**
     * A function to be used in conjunction with {Injectable} middleware. This middleware uses the application's dependency injection module to
     * provide the parameters of the function.  
     * 
     * @export
     * @interface ServiceFunction
     */
    export interface ServiceFunction {
        (...args: any[]): Action;

        /**
         * an array of component names to be injected into the service function. 
         * 
         * @type {string[]}
         */
        $inject:string[];
    }

    /**
     * An action that requires action to services registered within the application's dependency injection module. 
     * 
     * @export
     * @interface ServiceAction
     * @extends {Action}
     */
    export interface ServiceAction extends Action {
        /**
         * A service function to be injected using the application's depenecy injection module.
         * 
         * @type {ServiceFunction}
         */
        service: ServiceFunction; 
        $inject:string[]; 
    }

    export interface PersistenceStrategy {
        put(key:string,data:any):Promise<any>;
        get(key:string):Promise<any>;
    }

    
    /**
     * Default properties of {ControllerView} components
     * 
     * @export
     * @interface ControllerViewProps
     */
    export interface ControllerViewProps {
        /**
         * (description)
         * 
         * @type {Store}
         */
        store:Store;

        persistenceStrategy?:PersistenceStrategy;

    }
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
    export class ControllerView<T extends ControllerViewProps,S> extends React.Component<T,S> {
        /**
         * The application state store
         * 
         * @type {Store}
         */
        $$store: Store;
        /**
         * The key to address the component's space in the application state. 
         * 
         * @type {string}
         */
        $$stateKey: string;
        /**
         * The component's reducer function.
         * 
         * @type {Reducer}
         */
        $$reducer:Reducer;
        /**
         * Creates an instance of ControllerView.
         * 
         * @param {T} props the properties of the component
         * @param {string} stateKey the key to address the component's space in the application state. 
         * @param {*} initialState the initial state of the components, this is also passed to the store upon mounting. 
         * @param {Reducer} reducer the reducer function of the component, this is also passed to the store upon mounting. 
         */
        dispatch:DispatchFn<any>;
        constructor(props:T,stateKey:string,initialState:S,reducer:Reducer);

        /**
         * Returns the component's reducer function 
         * 
         * @returns the component's {Reducer} 
         */
        getReducer():Reducer;

        /**
         * Returns the component's state key.
         * 
         * @returns {string} the component's state key.
         */
        getStateKey():string;

        /**
         * To be called when the component is first mounted to connect the component to the application store. 
         * Note: if this method is overriden in the child class, the child class must call `super.componentDidMount()` 
         */
        componentDidMount():void;

        /**
         * To be called before the component is unmounted to disconnect the component from the application store. 
         * Note: if this method is overriden in the child class, the child class must call `super.componentWillUnmount()`
         */
        componentWillUnmount();
    }

    class Combiner {
        /**
         * Create a new instance of {Combine} with the provided reducers. 
         * 
         * @static
         * @param {...Reducer[]} args the reducers to register
         * @returns (description)
         */
        static combine(...args:Reducer[]):Combiner;
        /**
         * the registered reducers within the application. 
         * 
         * @type {Dictionary<Reducer>}
         */
        reducers:Dictionary<Reducer>
        /**
         * Creates an instance of Combiner.
         * 
         * @param {...Reducer[]} args (description)
         */
        constructor(...args:Reducer[]);

        /**
         * Adds a reducer to the list of registered reducers.
         * 
         * @param {Reducer} reducer (description)
         */
        addReducer(reducer: Reducer): void;
        /**
         * Adds a reducer to the application given a name and a reducer function. 
         * 
         * @param {string} name the name to attach the reducer to. 
         * @param {Reducer} reducer the reducer function. 
         */
        addReducer(name: string, reducer: Reducer): void;
        
        addReducer(r:any):void;

        /**
         * Removes a reducer function from the list of registered reducers. 
         * 
         * @param {Reducer} reducer the reducer function to remove. 
         */
        removeReducer(reducer: Reducer): void;
        /**
         * Removes a reducer function from the list of reducers given its name. 
         * 
         * @param {string} name the name of the reducer to remove. 
         */
        removeReducer(name: string): void;
        
        removeReducer(r:any):void;

        /**
         * Invoked by an application store upon receiving a new action to generate the new application state. 
         * 
         * @param {*} state an Immutable.Map instance.  
         * @param {Action} action the action to respond to. 
         * @returns the new application state which is an instance of Immutable.Map
         */
        update(state:any,action:Action);

        
    }

    /**
     * Creates a middleware that can handle {PromiseAction} 
     * 
     * @export
     * @param {Injector} injector an injector instance to use for dependency resolution. 
     * @returns {Middleware} a middleware.
     */
    export function Injectable(injector:Injector):(action:ServiceAction,store:Store)=>Action;

    export class Injector {
        /**
         * an object literal containing all registered components. 
         * 
         * @type {Dictionary<any>}
         */
        components: Dictionary<any>;
        /**
         * an object literal containing instances of the registered components. 
         * 
         * @type {Dictionary<any>}
         */
        instances: Dictionary<any>;
        /**
         * Used internally to resolve dependencies.  
         */
        private stack: Array<any>;
        /**
         * Creates an instance of Injector.
         */
        constructor();

        /**
         * Adds an instance to the list of registered instances within the module. 
         * 
         * @param {string} name the name of the instance 
         * @param {*} c the instance, this can be a primitive, function, or an object. 
         * @returns the registered instance. 
         */
        public addInstance(name:string,c:any);

        /**
         * Adds a component to the list of registered components within the module. 
         * ES6 class components should implement a static function `factory` and should include 
         * a static member `$inject` including a list of dependencies. The module will resolve the required 
         * dependencies and pass them to the static `factory` method which should return an instance of the 
         * compnent. 
         * 
         * @param {string} name the name of the component. 
         * @param {*} c the component to register
         * @returns the component. 
         */
        public addComponent(name:string,c:any);

        /**
         * Checks whether a component exists or not
         * 
         * @param {string} name the name of the component. 
         * @returns {boolean} true if the component exists false otherwise. 
         */
        public hasComponent(name:string):boolean;

        /**
         * Checks whether an instance is registered or not. 
         * 
         * @param {string} name the name of the component. 
         * @returns {boolean} returns the instance or undefined otherwise. 
         */
        public hasInstance(name:string):boolean;

        /**
         * Given a function that requires access to some components, this method injects the function with the required  
         * 
         * @param {Function|ServiceFunction} fn the function to inject
         * @param {*} [ctx] (description)
         * @param {...any[]} args (description)
         * @returns (description)
         */
        public injectFunction(fn:any,ctx?:any,...args:any[]);

        private _inject(name:string, c:any):any;

        /**
         * (description)
         * 
         * @param {string} name (description)
         * @returns {*} (description)
         */
        public get(name:string):any;

        /**
         * (description)
         * 
         * @param {string} name (description)
         * @param {Object} o (description)
         * @returns {Injector} (description)
         */
        public register(name: string, o: Object): Injector;
        /**
         * (description)
         * 
         * @param {string} name (description)
         * @param {number} n (description)
         * @returns {Injector} (description)
         */
        public register(name: string, n: number): Injector;
        /**
         * (description)
         * 
         * @param {string} name (description)
         * @param {Function} fn (description)
         * @returns {Injector} (description)
         */
        public register(name: string, fn: Function): Injector;
        /**
         * (description)
         * 
         * @param {string} name (description)
         * @param {Array<any>} array (description)
         * @returns {Injector} (description)
         */
        public register(name:string, array: Array<any>): Injector;
        /**
         * (description)
         * 
         * @param {Array<any>} array (description)
         * @returns {Injector} (description)
         */
        public register(array: Array<any>): Injector;
        /**
         * (description)
         * 
         * @returns {Injector} (description)
         */
        public register():Injector;
    }

    /**
     * A function that receives the currently dispatched {Action} and the application store and returns either a new {Action} object or 
     * null to stop the execution of the dispatched action. 
     * Middlewares are useful in handling specific types of actions such as actions that need to wait for a promise to be resolved, or 
     * require access some third-party APIs, etc. 
     * @see {IntegerPromisifyMiddleware}
     * @see {PromisifyMiddleware} 
     * @see {InjectableMiddleware} 
     */
    export interface Middleware {
        (arg:Action,store:Store):Action
    }

    export function Promisify<T>(action:PromiseAction<T>,store:Store):Action; 

    /**
     * A function that receives the current state of a {ControllerView} component, and an {Action}, and it returns 
     * either the new state of the {ControllerView} component if the {Action} changes the state, or a 
     * the current state if no changes were made to the state. 
     * @export
     * @interface Reducer
     */

    export interface Reducer{
        (state: Immutable.Map<string,any>, action: Action): Immutable.Map<string,any>;
        /**
         * the name of the reducer function.
         * 
         * @type {string}
         */
        name?: string;
    }

    export interface StatefulComponent<T> {
        setState(newState:any); 
        getStateKey():string;
        getReducer():Reducer;
        setState(state:T,onDone?:()=>void):void;
        state:T; 
    }


    export interface StoreOptions {
        ready?:boolean; 
        initialState?:Immutable.Map<string,any>; 
        middlewares?:Middleware[]; 
        trackChanges?:boolean;
    }

    export interface DispatchFn<T extends Action> {
        (action:T):any;
    } 

    interface Dispatcher {
        run(c:StatefulComponent<any>,newState:any);
    }

    enum ChangeStatus {
        PENDING = 1, 
        EXECUTING = 2,
        FINISHED = 3,
        OBSELETE = 4,
    }

    interface StateChange {
        key:string;
        value:any;
        status:ChangeStatus;
    }

    /**
     * A {Store} component is the main component responsible for managing the application's state. 
     * Internally, the state is an instance of {Immutable.Map<string,any>}. Each {ControllerView} connects 
     * to the {Store} using a specific state key. The state key of each component is used to scope the application
     * state into sections that are managed by different {ControllerView} components. In a StrikeJS application, 
     * there is only one Store.  
     * 
     * 
     * @export
     * @class Store
     */
    export class Store {
        /**
         * 
         * 
         * @type {Dispatcher}
         * @memberOf Store
         */
        dispatcher:Dispatcher;
        /**
         * The application state.
         * 
         * @type {Immutable.Map<string,any>}
         */
        state:Immutable.Map<string,any>;
        /**
         * A queue of any pending actions. This is useful to catch any actions that are dispatched before the Store enters the ready state. 
         * Once the store becomes ready, all pending actions are dispatched in the same order they're received. 
         * 
         * @type {Action[]}
         */
        queue: Action[];
        /**
         * A list of middleware functions that are registered with the store. Middlewares are useful in handling specific types of actions. 
         * 
         * @type {Array<Middleware>}
         */
        middleware:Array<Middleware>;
        
        /**
         * A combiner is responsible for creating the application's next state upon receiving an Action. 
         * All {ControllerView} are registered with the combiner which receives the overall state of the application 
         * and executes all of the reducers registered with it passing the appropriate part of the application state to each
         * reducer. 
         * 
         * @type {Combiner}
         */
        combiner:Combiner;
        /**
         * A reference to the previous state of the application. 
         * 
         * @type {*}
         */
        prevState:any;
        /**
         * A list of all the actions that have been dispatched so far. This is only activated if the {trackChanges} flag is set to true. 
         * The features allows for recreating a specific application state depending on all the actions that have been dispatched so far. 
         * @type {Array<any>}
         */
        prevActions:Array<any>;
        /**
         * All {ControllerView} components that are registered with the store. 
         * 
         * @type {Array<ControllerView<any,any>>}
         */
        components:StatefulComponent<any>[];
        /**
         * Whether actions should be tracked or not. 
         * Note: the tracked actions are those actions that pass through all the middlewares and are the ones that 
         * are received by the reducers. Defaults to false
         * 
         * @type {boolean}
         */
        trackChanges:boolean;
        /**
         * Whether the store is ready to dispatch actions or not. 
         * The flag can be used to ensure that the store to start executing actions after specific conditions are met.
         * Defaults to false. 
         * 
         * @type {boolean}
         */
        readyForActions: boolean;

        /**
         * Creates an instance of Store.
         * 
         * @param {Immutable.Map<string,any>} initialState the initial state of the application. It must be an instance of {Immutable.Map}.
         * @param {Combiner} combiner the application combiner
         * @param {Array<Middleware>} [middleware] an array of middleware functions. 
         * @param {boolean} [trackChanges] whether to track actions or not. 
         * @param {boolean} [readiness] whether the store is ready or not. 
         */
        constructor(opts:StoreOptions);

        /**
         * Connects a {ControllerView} component to the application store. Mainly three things happen here:
         * 1. Add the {ControllerView} component to the list of components within the store. 
         * 2. Register the {ControllerView} component's Reducer with the {Combiner}. 
         * 3. Set the state at the {ControllerView} component's state key to the current state of the {ControllerView} component's state. The state is registered as an instance of {Immutable.Map<string,any>}.
         * 
         * @param {ControllerView<any,any>} elem (description)
         */
        public connect(elem:StatefulComponent<any>):void ;

        /**
         * Add a given middleware to the list of registered middleware. 
         * Note: middlewares are executed in order, so order does matter. 
         * For example, a middleware that transforms an injectable action to a promise action, 
         * must be registered before the promisify middleware, such that the results of the injectable 
         * middleware can be handled by the promisify middlware.  
         * 
         * @param {Middleware} fn the middlware to register
         */
        public addMiddleware(fn:Middleware):void;

        /**
         * Remove a specific middlware from the list of registered middlewares. 
         * Note: the same exact function that has been registered must be passed in order for it to be removed.  
         * @param {Middleware} fn the middlware function to remove. 
         */
        public removeMiddleware(fn:Middleware):void;

        /**
         * Dispatches the last action that has been dispatches. 
         * Note: this is only if the trackChanges flag has been set to true. 
         */
        public prev():void;

        /**
         * Get part of the application state at a given key.
         * 
         * @param {string} key the state key to get the state at. 
         * @returns {Immutable.Map<stirng,any>} 
         */
        public getStateAt(key:string):Immutable.Map<string,any>;

        /**
         * Get the overall application state. 
         * 
         * @returns {Immutable.Map<string,any>} (description)
         */
        public getState():Immutable.Map<string,any>;

        /**
         * Replaces part of the application at a given key. 
         * 
         * @param {string} key the key to the part of state to replace. 
         * @param {Immutable.Map<string,any>} val the new value for the specific part. 
         */
        public replaceStateAt(key:string,val:Immutable.Map<string,any>);

        /**
         * Deletes part of the application state at a given key.
         * 
         * @param {string} key the key to the part of state to delete. 
         */
        public deleteStateAt(key:string);

        /**
         * Applies the registered middlewares to an action. 
         * 
         * @param {Action} action 
         * @returns {Action} the action that resulted from applying all the middleware functions.
         */
        public applyMiddleware(action:Action):Action;

        /**
         * Disconnects a {ControllerView} from the application store. Three things happen here:
         * 1. Delete the part of the state managed by the {ControllerView} component.
         * 2. Remove the component's reducer function from the {Combiner}. 
         * 3. Remove the component from the list of registered {ControllerView} components.
         * 
         * @param {ControllerView<any,any>} component 
         */
        public disconnect(component:StatefulComponent<any>);

        /**
         * Called upon dispatching an Action within the application. The following happen here:
         * 1. If the store is not in a ready state i.e. readyForActions is set to false, the action is added to the store's queue, and the function returns. 
         * 2. If the store is ready, the previous state is set to the current state. 
         * 3. The action is passed to the middlewares. 
         * 4. If the result of applying the middlewares is null, the function returns. Otherwise, 
         * 5. If the trackChanges flag is set to true, the action is pushed to the list of previous actions. 
         * 6. The action is then passed to the combiner along with the current application state. 
         * 7. The combiner executes all the registered reducer functions, and returns the new application state.
         * 8. The store then loops through all the ControllerView components and only updates the ones that their state have changed. 
         * 
         * @param {Action} action (description)
         * @returns {*} (description)
         */
        public dispatch<T extends Action>(action: T):any;

        executeWithState<T>(fn:(...args:any[])=>T,statekeys:string[]):T;

        /**
         * Sets the store to be ready to dispatch actions, and dispatches all actions that were added to the queue. 
         */
        public ready():void;

        /**
         * A singleton refernece to the application's store. 
         * 
         * @static
         * @type {Store}
         */
        static singleton: Store;

        /**
         * Creates an instance of the Store class. 
         * 
         * @static
         * @param {*} initialState (description)
         * @param {Combiner} combiner (description)
         * @param {Array<Middleware>} [middleware] (description)
         * @param {boolean} [trackChanges] (description)
         * @param {boolean} [readiness] (description)
         * @returns (description)
         */
        static create(initialState: Immutable.Map<string,any>,
            middleware?: Array<Middleware>,
            trackChanges?: boolean,
            readiness?:boolean);
    }



    export function IntegerPromisifer<T>(fetching:number,resolved:number,rejected:number):(action: PromiseAction<T>, store: Store)=>Action;


    /**
     * (description)
     * 
     * @export
     * @interface WorkerAction
     * @extends {Action}
     */
    export interface WorkerAction extends Action {
        /**
         * (description)
         * 
         * @type {boolean}
         */
        isWorker: boolean;
    }
    /**
     * (description)
     * 
     * @export
     * @param {Worker} worker (description)
     * @param {Store} store (description)
     * @returns {Middleware} (description)
     */
    export function WorkerMiddleware(worker: Worker, store: Store):Middleware;


    export function localStorageStrategy():PersistenceStrategy;


}
