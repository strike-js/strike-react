import {createPool,Pool} from './Pool'; 
import {Reducer} from './Reducer';
import {IMiddleware} from './Middleware';
import {IManagedState,createManagedState} from './ManagedState'; 
import {StatefulComponent} from './StatefulComponent';
import * as React from 'react'; 
import {Action} from './Action';

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
export interface ActionGenerator<V>{
	(dispatch:(action:Action|ActionGenerator<any>)=>void,getState:<T>(key:string)=>T,extra?:V);
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
	dispatch(action:Action):void;  
	/**
	 * Passes the dispatch fn to an action generator function 
	 * @param {ActionGenerator} actionGenerator the action generator to dispatch 
	 */
	dispatch<V>(actionGenerator:ActionGenerator<V>,extra?:V):void;
	/**
	 * Passes a state key to be passed as the extra parameter for the action generator 
	 */
	dispatch<V>(key:string,fn:ActionGenerator<V>):void; 
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
export function createStore(cfg:StoreCfg):IStore{
	let components:Dictionary<StatefulComponent<any,any>> = {}; 
	let actions:Dictionary<Action> = {}; 
	let backlog:Action[] = [];
	let middlewares:IMiddleware[] = cfg.middlewares || [];
	let isReady = typeof cfg.ready === "undefined"?true:cfg.ready; 
	let trackChanges = typeof cfg.trackChanges === "undefined"?false:cfg.trackChanges; 
	let o:IStore = null;
	let queue:Action[] = [];
	let state = {}; 
	let pool = createPool(createManagedState); 
	let pendingChanges = {}; 
	let waitingQueue = {}; 

	function connect<T,V>(el:StatefulComponent<T,V>):IStore{
		var key = el.getStateKey(); 
		components[key] = el; 
		state[key] = el.state; 
		waitingQueue[key] = undefined; 
		pendingChanges[key] = false; 
		return o; 
	} 

	function disconnect<T,V>(el:StatefulComponent<T,V>):IStore{
		delete components[el.getStateKey()]; 
		delete waitingQueue[el.getStateKey()];
		delete pendingChanges[el.getStateKey()]; 
		delete state[el.getStateKey()]; 
		return o;
	}

	function getStateAt<T>(key:string){
		return state[key]; 
		// return components[key] && components[key].state; 
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

	function hasPendingChanges(key:string){
		return pendingChanges[key]; 
	}

	function doneExecute(key){
		if (waitingQueue[key] && waitingQueue[key].length){
			waitingQueue[key].shift()(); 
			return; 
		}
		// pendingChanges[key] = false; 
	}
	
	function doExecute(key,action){
		let managedState = pool.get();
		let component = components[key]; 
		managedState.setState(state[key]); 
		let rd = component.getReducer();
		if (rd){
			rd(managedState,action);
			if (managedState.hasChanges()){
				var changes = managedState.changes(); 
				// pendingChanges[key] = true; 
				component.setState(()=>changes,()=>{
					// pendingChanges[key] = false; 
					// doneExecute(key);
					action.onDone && action.onDone(); 
				});
			}
		}
		pool.put(managedState);
	}

	function whenReady(key,action){
		waitingQueue[key] = waitingQueue[key] || []; 
		waitingQueue[key].push(()=>{
			doExecute(key,action); 
		});
	}

	function execute(action){
		if (action){
			if (trackChanges){
				backlog.push(action);
			}
			for(var key in components){
				// if (hasPendingChanges(key)){
				// 	whenReady(key,action);
				// 	continue; 
				// }
				doExecute(key,action); 
			}
		}
	}

	function ready(){
		isReady = true; 
		let action:Action = null;
		while((action = queue.shift())){
			dispatch.apply(null,action);
		}
	}

	function onAction(action:Action){
		let act = applyMiddleware(action,(finalAction)=>{
			finalAction && execute(finalAction); 
		}); 
	}

	function onActionFail(err:Error){
		console.log(err,err.message,err.stack);
	}

	function dispatch(action:Action):void;
	function dispatch<T>(generator:ActionGenerator<T>,extra?:T):void;
	function dispatch<T>(key:string,generator:ActionGenerator<T>):void;
	function dispatch(...args:any[]){
		if (!isReady){
			queue.push(Array.prototype.slice.call(args,0));
			return;
		}
		if (args.length === 0){
			throw new Error(`No action provided`); 
		}else if (args.length === 1){
			if (typeof args[0] === "function"){
				args[0](dispatch,getStateAt);
			}else if (typeof args[0] === "object"){
				onAction(args[0]);
			}
		}else if (args.length === 2){
			if ((typeof args[0] === "string" || 
				typeof args[0] === "number") && 
				typeof args[1] !== "object") {
				onAction({
					type:args[0],
					data:args[1]
				});
			} else if (typeof args[0] === "string" &&
				typeof args[1] === "function"){
				let st = getStateAt(args[0]); 
				args[1](dispatch,getStateAt,st);
			} else if (typeof args[0] === "function"){
				args[0](dispatch,getStateAt,args[1]); 
			}
		}
	}


	o = {
		connect,
		disconnect,
		getStateAt,
		setStateAt,
		dispatch,
		ready,
	}; 

	return o; 
}