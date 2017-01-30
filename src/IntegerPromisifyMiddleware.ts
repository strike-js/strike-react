import {Middleware} from './Middleware';
import {PromiseAction, Action} from './Action';
import {Store} from './Store';


export function IntegerPromisifer(fetching:number,resolved:number,rejected:number){

	/**
	 * (description)
	 * 
	 * @export
	 * @template T
	 * @param {PromiseAction<T>} action (description)
	 * @param {Store} store (description)
	 * @returns {Action} (description)
	 */
	return function IntegerPromisify<T>(action: PromiseAction<T>, store: Store): Action {
		if (typeof action.promise === "undefined") {
			return action;
		}
		action.promise.then(function(data: T) {
			store.dispatch({
				type: resolved | action.type as number,
				data: data
			});
		}, function(data: any) {
			store.dispatch({
				type: rejected | action.type as number,
				data: data
			})
		});
		return {
			type: fetching | <number>action.type,
			data: action.data
		};
	}
} 