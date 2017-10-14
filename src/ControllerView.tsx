import * as React from 'react';
import {Action} from './Action'; 
import { IStore, StoreCfg, DispatchFn } from './Store'; 
import {IManagedState} from './ManagedState'; 
import {DependencyContainer} from './Injector'; 
import {IMiddleware,IMiddlewareNext} from './Middleware'; 
import {PersistenceStrategy,FunctionalPersistenceStrategy} from './PersistenceStrategy'; 

export type RouteParams = Dictionary<any> & {test(path:string):any,path:string,route:string};
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
	dispatch:DispatchFn;

	routeParams?:RouteParams; 

	dataStore?:DataStore; 

	router?:any;

	persistenceStrategy?:PersistenceStrategy|FunctionalPersistenceStrategy;
}

/**
 * Data store 
 */
export interface DataStore {
	get(key:string):any; 
	set(key:string,val:any):any;
}


export interface FunctionalComponent<T>{
	(props:T):React.ReactElement<T>; 
}

export interface ControllerViewConfig<State,Props extends ControllerProps<State>> {
	reducer?(state:any,action:Action):void;
	initialState?:State|((props:Props)=>State);
	stateKey:string;
	component:React.ComponentClass<Props>|FunctionalComponent<Props>;
	deps?:string[]|Dictionary<string>;
	propsToPropagate?:string[];
	propsToData?:(props:Props,data:State)=>State;
	propsModifier?(props:Props,dest:Dictionary<any>):void;
}

export function createControllerView<State,Props extends ControllerProps<State>>({
	component,
	reducer,
	initialState,
	deps,propsModifier,
	propsToPropagate,
	propsToData, 
	stateKey}:ControllerViewConfig<State,Props>){
	var store:IStore = null; 
	var injector:DependencyContainer = null; 
	var propsObject:ControllerProps<State> = {
		data:null,
		store:null,
		dispatch:null
	}; 

	return class extends React.Component<Props,State>{
		constructor(props:Props){
			super(props); 
			this.state = typeof initialState === "function"?initialState(props):initialState; 
			
			store = props.store; 
			propsObject.store = props.store;
			propsObject.dataStore = props.dataStore; 
			propsObject.dispatch = store.dispatch; 
			propsObject.router = props.router; 
			this.propagateProps(props); 
			
			if (deps && injector){
				if (deps instanceof Array){
					deps.forEach((e)=>{
						propsObject[e] = injector.get(e)
					})
				}else if (typeof deps === "object") {
					for(let kk in deps){
						propsObject[deps[kk]] = injector.get(kk);
					}
				}
			}
		}

		propagateProps(props:Props){
			propsObject.routeParams = props.routeParams;
			if (propsToPropagate instanceof Array){
				propsToPropagate.forEach((e)=>{
					propsObject[e] = props[e]; 
				});
			}
			if (typeof propsModifier === "function"){
				propsModifier(props,propsObject); 
			}
		}

		getStateKey(){
			return stateKey; 
		}

		getReducer(){
			return reducer; 
		}

		componentWillReceiveProps(props){
			this.propagateProps(props); 
		}

		componentWillMount(){
			store.connect<Props,State>(this);
		}

		componentDidMount(){
			const persistenceStrategy = this.props.persistenceStrategy; 
			if (persistenceStrategy){
				if (typeof persistenceStrategy === "function"){
					(persistenceStrategy as FunctionalPersistenceStrategy)(stateKey,(err,data)=>{
						if (err){
							console.error(err.message,err.stack); 
							return;
						}
						this.setState(data);
					});
				} else if (typeof persistenceStrategy === "object"){
					let persist:PersistenceStrategy = persistenceStrategy as any; 
					if (typeof persist.get === "function"){
						if (persist.get.length === 2){
							persist.get(stateKey,(err,data)=>{
								if (err){
									throw err; 
								}
								this.setState(data); 
							});
						}else if (persist.get.length === 1){
							return persist.get(stateKey).then((data)=>{
								this.setState(data); 
							},(err)=>{
								console.log(err);
							});
						}
					}
				}
			}
		}

		componentWillUnmount(){
			let state = this.state; 
			const persistenceStrategy = this.props.persistenceStrategy; 
			if (typeof persistenceStrategy === "function"){
				(persistenceStrategy as FunctionalPersistenceStrategy)(stateKey,state,(err,data)=>{
					store.disconnect<Props,State>(this);
					if (err){
						throw err;
					}
				});
				return; 
			}else if (typeof persistenceStrategy === "object" && 
				(persistenceStrategy as any).get !== "undefined"){
				let p:PersistenceStrategy = persistenceStrategy as any; 
				if (p.put.length === 2) {
					p.put(stateKey,state).then((data)=>{
						store.disconnect<Props,State>(this);
					},(err)=>{
						console.log(err);
					});
					return; 
				} else if (p.put.length === 3) {
					p.put(stateKey,state,(err,data)=>{
						store.disconnect<Props,State>(this);
						if (err){
							throw err; 
						}
					});
					return; 
				} 
			} 
			store.disconnect<Props,State>(this);
		}

		render(){
			var k = 
			propsObject.data = typeof propsToData === "function"?({...(this.state || {} as  any),...(propsToData(propsObject as any,this.state) as any)}):this.state; 
			
			return React.createElement(component as any,
				propsObject,
				this.props.children); 
		}
	}
}