import {IMiddleware,IMiddlewareNext} from './Middleware';
import {PromiseAction, Action} from './Action';
import {IStore} from './Store';

/**
 * Creates a middleware to handle action with ES6 Promises.
 * @param {number|string} fetching fetching prefix for the actoin. Defaults to 'Fetching' 
 * @param {number|string} resolved resolved prefix for the action. Defaults to 'Resolved' 
 * @param {number|string} rejected rejected prefix for the action. Defaults to 'Rejected' 
 * @returns {IMiddlware} the promisify middleware. 
 */
export function PromisifyMiddleware(fetching:number|string='Fetching',resolved:number|string='Resolved',rejected:number|string='Rejected'):IMiddleware{
	function makeAction(actionType:string|number,type:string|number){
		if (typeof actionType === "number" && 
			typeof type === "number"){
			return type | actionType; 
		}
		return <string>type+actionType; 
	}
	return function IntegerPromisify<T>(action: PromiseAction<T>, store: IStore, next:IMiddlewareNext): void {
		if (!action.promise || 
			typeof action.promise !== "object" || 
			typeof action.promise.then !== "function") {
			next(action); 
			return; 
		}

		action.promise.then(function(data: T) {
			store.dispatch({
				type: makeAction(action.type,resolved),
				data: data
			});
		}, function(data: any) {
			store.dispatch({
				type: makeAction(action.type,rejected),
				data: data
			})
		});
		next({
			type: makeAction(action.type,fetching),
			data: action.data
		});
	}
} 