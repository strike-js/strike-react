import {createPool,Pool} from './Pool'; 
import {Reducer} from './Reducer';
import {IMiddleware} from './Middleware';
import {IManagedState,createManagedState} from './ManagedState'; 
import {StatefulComponent} from './StatefulComponent';
import * as React from 'react'; 
import {Action} from './Action';

/**
 * Returns value at a given key with in an object literal. 
 * 
 * @export
 * @param {object} object the object to use 
 * @param {string} path the path to return its value 
 * @param {string} p path separator, defaults to '.'
 * @returns {any} the value at the given key 
 */
export function getDataAt<T>(object: any, path: string, p: string): T {
   let o: any = object,
	   key: string,
	   temp: any,
	   pathSep: string = p ? p : '.',
	   list: string[] = path.split(pathSep);
   while ((key = list.shift()) && (temp = o[key]) && (o = temp));
   return temp;
}

export interface DispatchFn {
	<V,R>(fn:(dispatch:DispatchFn,getState:StateGetter,extra:V)=>R,extra:V):R;
	<V>(fn:(dispatch:DispatchFn,getState:StateGetter)=>V):V;
	<V>(action:Action,cb:()=>void):void; 
	(action:Action):Promise<void>;  
}

export type StateGetter = <T>(key:string)=>T; 

/**
 * Represents store configuration options 
 */
export interface StoreCfg {
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
	 * @returns {Promise<void>} if promises are supported by the browser. 
	 * The promise is resolved when the view is updated. Otherwise, returns `void`. 
	 * @throws {Error} if no action is provided 
	 */
	dispatch:DispatchFn;
}

/**
 * Creates a state container instance with the provided configurations
 * @param {StoreCfg} cfg the store configurations. 
 * @returns {IStore} 
 */
export function createStore(cfg:StoreCfg):IStore{
	let components:Dictionary<StatefulComponent<any,any>> = {}; 
	let actions:Dictionary<Action> = {}; 
	let backlog:Action[] = [];
	let middlewares:IMiddleware[] = cfg.middlewares || [];
	let trackChanges = typeof cfg.trackChanges === "undefined"?false:cfg.trackChanges; 
	let o:IStore = null;
	let state = {}; 
	let pool = createPool(createManagedState); 

	function connect<T,V>(el:StatefulComponent<T,V>):IStore{
		var key = el.getStateKey(); 
		components[key] = el; 
		state[key] = el.state || {}; 
		return o; 
	} 

	function disconnect<T,V>(el:StatefulComponent<T,V>):IStore{
		delete components[el.getStateKey()]; 
		delete state[el.getStateKey()]; 
		return o;
	}

	function getStateAt<T>(key:string){
		return getDataAt<T>(state,key,'.');//state[key]; 
	}

	function setStateAt<T>(key:string,val:T):IStore{
		if (components[key]){
			state[key] = val; 
			components[key].setState(state[key]);
			return o; 
		}
		throw new Error(`Component with key ${key} could not be found`); 
	}

	function applyMiddleware(action:Action,done:(action:Action|null|undefined)=>void):void{
		let idx = 0; 
		let m:IMiddleware = null;

		function next(action?:Action){
			if (!action || idx >= middlewares.length){
				return done(action); 
			}
			m = middlewares[idx]; 
			idx++; 
			return m(action,o,next);
		}
		next(action); 
	}
	
	function doExecute(key,action){
		let managedState = pool.get();
		let component = components[key]; 
		managedState.setState(state[key]); 
		let rd = component.getReducer();
		if (rd){
			rd(managedState,action);
			if (managedState.hasChanges()){
				action.__executed = true; 
				var changes = managedState.changes(); 
				component.setState(()=>changes,()=>{
					action.__done && typeof action.__done === "function" && action.__done(); 
				});
			}
		}
		pool.put(managedState);
	}

	function execute(action){
		if (action){
			if (trackChanges){
				backlog.push(action);
			}
			for(var key in components){
				doExecute(key,action); 
			}
			if (!action.__executed){
				action.__done();
			}
		}
	}

	function onAction(action:Action,cb?:()=>void){
		action.__done = cb ; 
		action.__executed = false; 
		if (!cb){
			if (typeof Promise !== "undefined"){
				return new Promise((res)=>{
					action.__done = res; 
					let act = applyMiddleware(action,(finalAction)=>{
						finalAction && execute(finalAction); 
					}); 
				});
			}
		}
		let act = applyMiddleware(action,(finalAction)=>{
			finalAction && execute(finalAction); 
		}); 
	}

	function onActionFail(err:Error){
		console.log(err,err.message,err.stack);
	}

	const dispatch:DispatchFn = function(...args:any[]){
		if (args.length === 0){
			throw new Error(`No action provided`); 
		}else if (args.length === 1){
			if (typeof args[0] === "function"){
				return args[0](dispatch,getStateAt);
			}else if (typeof args[0] === "object"){
				return onAction(args[0]);
			}
		}else if (args.length === 2){
			if (typeof args[0] === "function") {
				return args[0](dispatch,getStateAt,args[1]);
			}else if (typeof args[0] === "object"){
				return onAction(args[0],args[1]);
			}
		}
	}


	o = {
		connect,
		disconnect,
		getStateAt,
		setStateAt,
		dispatch
	}; 

	return o; 
}