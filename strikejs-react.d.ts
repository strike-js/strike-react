declare module "strikejs-react" {

    import * as React from 'react';

    /**
     * Routing params to be propagated if found
     */
    export type RouteParams = Dictionary<any> & {test(path:string):any,path:string,route:string};


    /**
     * Extracts the names of the parameters from functions
     * 
     * @export
     * @param {Function} fn the function to extract its parameters' names.
     * @returns {Array<string>} array of parameters names  
     */
    export function extractArgumentsFromFunction(fn: Function): any;
    
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

    /**
     * Data store 
     */
    export interface DataStore {
        get(key:string):any; 
        set(key:string,val:any):any;
    }

    /**
     * Properties that will be passed to the wrapped controller components. 
     * The state of the wrapping component will be passed inside `data`. 
     */
    export interface ControllerProps<V>{
        /**
         * The data as passed by the wrapping controller component. 
         */
        data:V; 
        /**
         * The store of the application.
         */
        store:IStore; 

        /**
         * Dispatches an action within the store. 
         * @param {Action} action the action to dispatch. 
         * @throws {Error} if no action is provided 
         */
        dispatch(action:Action|Promise<Action>|ActionReceiver):void;

        routeParams?:RouteParams; 

        dataStore?:DataStore; 

        router?:any;
    }

    /**
     * Default properties of {ControllerView} components
     * 
     * @export
     * @interface ControllerViewProps
     */
    export interface ControllerViewProps<T> {
        /**
         * 
         * @type {Store}
         */
        store:IStore;

        persistenceStrategy?:PersistenceStrategy|FunctionalPersistenceStrategy<T>;

        injector:DependencyContainer; 

        dataStore?:DataStore; 

        routeParams?:RouteParams;

        router?:any;

    }

    export interface FunctionalComponent<T>{
        (props:T):React.ReactElement<T>; 
    }

    export interface ControllerViewConfig<T,V> {
        reducer?(state:any,action:Action):void;
        initialState:V;
        stateKey:string;
        component:React.ComponentClass<T>|FunctionalComponent<T>;
        deps?:string[]|Dictionary<string>;
        propsToPropagate?:string[];
        initializer?<W extends ControllerViewProps<V>>(props:W,state:V):V; 
        propsModifier?<W extends ControllerViewProps<V>>(props:W,dest:Dictionary<any>):void;
    }

    export function createControllerView<T extends ControllerProps<V>,V,W extends ControllerViewProps<V>>(cfg:ControllerViewConfig<T,V>);

    /**
     * Creates a middleware that can handle {PromiseAction} 
     * 
     * @export
     * @param {Injector} injector an injector instance to use for dependency resolution. 
     * @returns {Middleware} a middleware.
     */
    export function Injectable(injector:Injector):IMiddleware;

    
    /**
     * A dependency injection module inspired by AngularJS's dependency injection. 
     * 
     * @export
     * @class Injector
     */
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

    export interface Dictionary<T>{
        [idx:string]:T;
    }

    export interface DependencyContainer{
        get<T>(key:string):T|Promise<T>; 
    }

    /**
     * Creates a persistence storage based on the localStorage. 
     * @returns {PersistenceStrategy}
     */
    export function localStorageStrategy():PersistenceStrategy;

    /**
     * Represents an internal state used by the state container to emulate immutability. 
     */
    export interface IManagedState {
        /**
         * Sets a specific attribute on the state. 
         * @param {string} key the key to set its value. 
         * @param {any} val the value of the state. 
         * @returns {IManagedState} the managed state instance. Useful for chaining changes. 
         */
        $set<T>(key:string,val:T):this;
        /**
         * Gets a specific attribute in the state. 
         * @param {string} key the key to get its value. 
         * @returns {any} the value at the provided key. 
         */
        $get<T>(key:string):T;
        /**
         * Push a new element to a specific attribute 
         */
        $push(key:string,...args:any[]):this; 
        /**
         * Removes an element from the beginning of an array 
         */
        $shift<T>(key:string):T; 
        /**
         * Adds an item to the beginning of an array
         */
        $unshift<T>(key:string,val:T):this; 
        /**
         * Remoes an element from the end of an array
         */
        $pop<T>(key:string):T;
        /**
         * Removes an element at a specific position 
         */
        $splice(key:string,index:number,count?:number,...args:any[]); 
        /**
         * Sets the state object managed by this managed state. 
         * @param {any} st the new state. 
         * @returns {IManagedState} the managed state instance. 
         */
        setState<T>(st:T):this;
        /**
         * Checks whether the managed state has any changes or not. 
         * @returns {boolean} 
         */
        hasChanges():boolean; 
        /**
         * Apply multiple mutations to the state
         */
        withMutations(cb:(state:IManagedState)=>void):void; 
        /**
         * Returns the changes made to the managed state. 
         * @returns {Dictionary<any>} 
         */
        changes():Dictionary<any>;
    }


    /**
     * Creates a managed state object 
     * @param {any} s the initial state to manage 
     * @returns {IManagedState} 
     */
    export function createManagedState<X>(s?:X):IManagedState;

    /**
     * A function that receives the currently dispatched {Action} and the application store and returns either a new {Action} object or 
     * null to stop the execution of the dispatched action. 
     * Middlewares are useful in handling specific types of actions such as actions that need to wait for a promise to be resolved, or 
     * require access some third-party APIs, etc. 
     * @see {IntegerPromisifyMiddleware}
     * @see {PromisifyMiddleware} 
     * @see {InjectableMiddleware} 
     */
    export interface IMiddleware {
        (action:Action,store:IStore,next:IMiddlewareNext):void; 
    }

    /**
     * Represents a callback to trigger the next middleware
     */
    export interface IMiddlewareNext {
        (action?:Action):void
    }

    /**
     * A persistence strategy for the state container. 
     */
    export interface PersistenceStrategy {
        /**
         * Save data at a given key.
         * @param {string} key the key to store the data at. 
         * @param {any} data the data to store. 
         * @returns {Promise<any>} 
         */
        put<T>(key:string,data:T):Promise<any>;
        /**
         * Save data at a given key. 
         * @param {string} key the key to store the data at. 
         * @param {any} data the data to store. 
         * @param {function} cb a callback after. 
         */
        put<T>(key:string,data:T,cb:(err:Error,data?:any)=>void):void;
        /**
         * Returns a state at a given key 
         * @param {string} key the key to retrieve its data.
         * @returns {Promise<any>} a promise resolving to the data. 
         */
        get<T>(key:string):Promise<T>;
        /**
         * Returns a state at a given key 
         * @param {string} key the key to retrieve its data. 
         * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
         */
        get<T>(key:string,cb:(err:Error,data:T)=>void):void
    }


    export interface FunctionalPersistenceStrategy<T>{
        /**
         * A function to rertrieve data from a persistence store. 
         * @param {string} key the key to the data. 
         * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
         */
        (key:string,cb:(err:Error,data:T)=>void):void; 
        /**
         * A function persistence strategy to store data in a persistence store. 
         * @param {string} key the key to the data. 
         * @param {any} data the data to store. 
         * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
         */
        (key:string,val:T,cb:(err:Error,data?:any)=>void):void; 
    }

    /**
     * An object pool 
     */
    export interface Pool<V> {
        /**
         * Returns an object from the pool. 
         * @param {any} v an optional to be passed to the generator function if provided. Otherwise, it is ignored. 
         * @returns {V} 
         */
        get(v?:any):V;  
        /**
         * Adds an object to the pool. 
         * @param {V} v object to add 
         */
        put(v:V):void; 
    }
    /**
     * Creates an object pool to help with object reuse. 
     * This is to optimise garabage collection in JS application. 
     * @param {function} make an object generator function. If provided, the function will be called when no the pool is empty.
     * @returns {Pool}
     */
    export function createPool<T>(make?:(...args:any[])=>T):Pool<T>;

    
    /**
     * Creates a middleware to handle action with ES6 Promises.
     * @param {number|string} fetching fetching prefix for the actoin. Defaults to 'Fetching' 
     * @param {number|string} resolved resolved prefix for the action. Defaults to 'Resolved' 
     * @param {number|string} rejected rejected prefix for the action. Defaults to 'Rejected' 
     * @returns {IMiddlware} the promisify middleware. 
     */
    export function PromisifyMiddleware(fetching:number|string,resolved:number|string,rejected:number|string):IMiddleware;

    /**
     * A function that receives the current state of a {ControllerView} component, and an {Action}, and it returns 
     * either the new state of the {ControllerView} component if the {Action} changes the state, or a 
     * the current state if no changes were made to the state. 
     * @export
     * @interface Reducer
     */
    export interface Reducer{
        (state:IManagedState,action:Action):void; 
    }

    
    /**
     * Represents a stateful component 
     */
    export interface StatefulComponent<V,T> {
        /**
         * Set the state of the component  
         * @param {T} newState the new state or partial state
         */
        setState<T>(newState:T):void;
        /**
         * Set the state of the component 
         * @param {function} updater an updater function that receives the previous state, 
         * and the properties of the component and returns an object containing the changes 
         * that needs to be applied to the state. 
         */
        setState<T>(updater:(prevState:T,props:V)=>T,cb?:()=>void):void; 
        /**
         * Returns the state key of the component. This is used internally by the state container. 
         * @returns {string} 
         */
        getStateKey():string;
        /**
         * Returns the reducer of the component. This is used internally by the state container. 
         * @returns {Reducer} 
         */
        getReducer():Reducer;
        /**
         * The state of the component 
         */
        state:T; 
    }

    
    /**
     * A function that consumes an {@link Action}
     */
    export interface ActionConsumer {
        (action:Action):void; 
    }

    /**
     * A function that receives an action consumer {@link ActionConsume} which is 
     * then called with an action. 
     */
    export interface ActionReceiver{
        (fn:ActionConsumer):void;
    }

    /**
     * Represents store configuration options 
     */
    export interface StoreCfg {
        /**
         * @type {boolean} 
         * @description whether the store is ready to execute actions. 
         */
        ready?:boolean; 
        /**
         * @type {boolean}
         * @description whether the store to track changes.
         */
        trackChanges?:boolean; 
        /**
         * @type {Array<Middleware>} 
         * @description an array of middlewares to add to the store. 
         */
        middlewares?:IMiddleware[];
    }

    /**
     * An action handler interface 
     */
    export interface ActionHandler<T> {
        (data:T):Action|ActionReceiver|Promise<Action>;
    }

    /**
     * A state container store 
     */
    export interface IStore {
        /**
         * Connects a component to the store. 
         * @param {StatefulComponent<T>} el the component to connect to the store. 
         * @returns {IStore} the store instance. 
         */
        connect<T,V>(el:StatefulComponent<T,V>):this;
        /**
         * Disconnects a component from the store. 
         * @param {StatefulComponent<T>} el the component to disconnect. 
         * @returns {IStore} the store instance. 
         */ 
        disconnect<T,V>(el:StatefulComponent<T,V>):this; 
        /**
         * Set the state of a specific component within the state. 
         * @param {string} key the component's key. 
         * @param {T} val the updated state. 
         * @returns {IStore} the store instance; 
         */
        setStateAt<T>(key:string,val:T):this; 
        /**
         * Get the state of a specific component. 
         * @param {string} key the component's key. 
         * @returns {T} the state of the component. 
         */
        getStateAt<T>(key:string):T; 
        /**
         * Dispatches an action within the store. 
         * @param {Action} action the action to dispatch. 
         * @throws {Error} if no action is provided 
         */
        dispatch(action:Action|Promise<Action>|ActionReceiver):void;  
        /**
         * Dispatches an action within the store. 
         * @param {string} key the key to the specific state to be passed to the consumer
         * @param {ActionHandler} handler a higher-order function that receives the specific part of the state. 
         */
        dispatch<T>(key:string,action:ActionHandler<T>):void; 
        /**
         * Sets the store to be ready to execute actions. 
         */
        ready():void;
    }

    /**
     * Creates a state container instance with the provided configurations
     * @param {StoreCfg} cfg the store configurations. 
     * @returns {IStore} 
     */
    export function createStore(cfg:StoreCfg):IStore;

    /**
     * Represents an action to be handled by a worker middleware. 
     */
    export interface WebSocketAction extends Action {
        websocket:"close"|"send";
        websocketId?:string;
    }

    /**
     * A middleware to handle websocket communication. 
     * @param {WebSocket} websocket the websocket to connect to. 
     * @param {IStore} store the state container instance. 
     * @returns {IMiddleware} the websocket middleware. 
     */
    export function WebSocketMiddleware (websocket:WebSocket,store:IStore):IMiddleware;

    /**
     * An action to be sent to a worker middleware
     * 
     * @export
     * @interface WorkerAction
     * @extends {Action}
     */
    export interface WorkerAction extends Action {
        /**
         * The worker identifier, if you're using the single worker middleware, 
         * you'll just need to set this to any truthy value. 
         */
        workerId:string;
        /**
         * Set this to true to terminate the worker with the provided ID. 
         * If no such worker is found, the action is ignored. 
         */
        terminate?:boolean;
    }

    /**
     * A worker registry interface. 
     * The interface represents a contract for a registry to manage multiple workers. 
     * @see {MultiWorkerMiddleware}
     */
    export interface WorkerRegistry{
        /**
         * Returns a worker with a given key (identifier)
         * @param {string} key the worker key 
         * @returns {Worker} the requested worker
         * @throws {Error} if no worker with the provided key exists. 
         */
        get(key:string):Worker;
        /**
         * Registers a worker with a key and a file.
         * @param {string} key the key to reference the worker by. 
         * @param {string|Worker} fileOrWorker either a file name to use with the worker 
         * or a worker object. 
         * @returns {WorkerRegistry} the current instance of the worker registry.
         */
        register(key:string,fileOrWorker:string|Worker):WorkerRegistry;
        /**
         * Terminates a worker with a given key
         * @param {string} key the worker key. 
         * @returns {WorkerRegistry} the current instance of the worker registry.
         */
        terminate(key:string):WorkerRegistry; 
    }

    /**
     * Creates a single worker middleware. 
     * @param {Worker} worker the worker to use. 
     * @param {IStore} store the store instance. 
     * @returns {IMiddleware} 
     */
    export function WorkerMiddleware(worker:Worker,store:IStore):IMiddleware;

    /**
     * Creates a multi-worker middleware. 
     * 
     * @param {WorkerRegistry} registry the worker registry to use. 
     * @param {IStore} store the state store instance 
     * @returns {Middleware} a multi-worker middleware 
     */
    export function MultiWorkerMiddleware(registry:WorkerRegistry,store: IStore):IMiddleware;

    /**
     * Creates a basic implementation of a worker registry. 
     * @returns {WorkerRegistry} 
     */
    export function createWorkerRegistry():WorkerRegistry;
}
