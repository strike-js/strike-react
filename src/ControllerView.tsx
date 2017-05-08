import * as React from 'react';
import {Action} from './Action'; 
import {IStore,StoreCfg} from './Store'; 
import {IManagedState} from './ManagedState'; 
import {DependencyContainer} from './Injector'; 
import {IMiddleware,IMiddlewareNext} from './Middleware'; 
import {PersistenceStrategy,FunctionalPersistenceStrategy} from './PersistenceStrategy'; 

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
	propsModifier?<W extends ControllerViewProps<V>>(props:W,dest:Dictionary<any>):void;
}

export function createControllerView<T extends ControllerProps<V>,V,W extends ControllerViewProps<V>>({
	component,
	reducer,
	initialState,
	deps,propsModifier,
	propsToPropagate,
	stateKey}:ControllerViewConfig<T,V>){
	var store:IStore = null; 
	var injector:DependencyContainer = null; 
	var propsObject:ControllerProps<V> = {
		data:null,
		store:null,
	}; 

	return class extends React.Component<W,V>{
		constructor(props:W){
			super(props); 
			this.state = initialState; 
			store = props.store; 
			injector = props.injector; 
			propsObject.store = props.store;
			this.propagateProps(props); 
			
			if (deps){
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

		propagateProps(props:W){
			if (propsToPropagate && 
				propsToPropagate instanceof Array){
				propsToPropagate.forEach((e)=>{
					propsObject[e] = props[e]; 
				});
			}
			if (propsModifier && 
				typeof propsModifier === "function"){
				propsModifier<W>(props,propsObject); 
			}
			(propsObject as any).routeParams = (props as any).routeParams;
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

		componentDidMount(){
			store.connect<T,V>(this);
			const persistenceStrategy = this.props.persistenceStrategy; 
			if (persistenceStrategy){
				if (typeof persistenceStrategy === "function"){
					(persistenceStrategy as FunctionalPersistenceStrategy<V>)(stateKey,(err,data)=>{
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
				(persistenceStrategy as FunctionalPersistenceStrategy<V>)(stateKey,state,(err,data)=>{
					store.disconnect<T,V>(this);
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
						store.disconnect<T,V>(this);
					},(err)=>{
						console.log(err);
					});
					return; 
				} else if (p.put.length === 3) {
					p.put(stateKey,state,(err,data)=>{
						store.disconnect<T,V>(this);
						if (err){
							throw err; 
						}
					});
					return; 
				} 
			} 
			store.disconnect<T,V>(this);
		}

		render(){
			propsObject.data = this.state; 
			return React.createElement(component as any,
				propsObject,
				this.props.children); 
		}
	}
}