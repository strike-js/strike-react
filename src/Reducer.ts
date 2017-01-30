import {Action} from './Action';

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
	name: string;
}