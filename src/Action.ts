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
