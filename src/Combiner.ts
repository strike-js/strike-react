import {Reducer} from './Reducer';
import {Dictionary} from 'strikejs-util';
import {Action} from './Action';

/**
 * Responsible for combining results of the reducers within the application to create the application's state. 
 * 
 * @export
 * @class Combiner
 */
export class Combiner {
	/**
	 * Create a new instance of {Combine} with the provided reducers. 
	 * 
	 * @static
	 * @param {...Reducer[]} args the reducers to register
	 * @returns (description)
	 */
	static combine(...args:Reducer[]){
		return new Combiner(...args);
	}
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
	constructor(...args:Reducer[]){
		this.reducers = {};
		let i = 0;
		for (i = 0; i < args.length;i++){
			this.addReducer(args[i]);
		}
	}

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
	
	addReducer(r:any):void{
		if (typeof r === "string" && arguments.length === 2){
			this.reducers[r] = arguments[1];
		}else if (typeof r === "function" && r.$name){
			this.reducers[r.$name] = r;
		}else if (typeof r === "function" && r.name){
			this.reducers[r.name] = r;
		}
	}

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
	
	removeReducer(r:any):void{
		if (typeof r === "function" && 
			r.$name && this.reducers[r.$name]){
			delete this.reducers[r.$name]; 
		}else if (typeof r === "function" &&
			r.name && this.reducers[r.name]){
			delete this.reducers[r.name]
		}else if (typeof r === "string" && 
			this.reducers[r]){
			delete this.reducers[r];
		}
	}

	/**
	 * Invoked by an application store upon receiving a new action to generate the new application state. 
	 * 
	 * @param {*} state an Immutable.Map instance.  
	 * @param {Action} action the action to respond to. 
	 * @returns the new application state which is an instance of Immutable.Map
	 */
	update(state:any,action:Action){
		let newState = state,
			key: string = null,
			reducers = this.reducers,
			temp2: any = null,
			temp: any = null;

		for(key in reducers) {
			temp2 = state.get(key);
			temp = reducers[key](temp2, action);
			if (temp != temp2){
				newState = newState.set(key, temp);
			}  
		}
		return newState;
	}

	
}