declare global {
    interface Dictionary<T>{
        [idx:string]:T;
    }
}
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
export function createManagedState<X>(s?:X):IManagedState{
	let state:X = s || null; 
	let _changes:Dictionary<any> = {};
	let o:IManagedState; 
	let _hasChanges = false; 

	function $set<T>(key:string,val:T){
		if (state[key] !== val){
			_changes[key] = val; 
			_hasChanges = true;
		}
		return o; 
	}

	function $get<T>(key:string){
		return state[key]; 
	}

	function setState(st:X){
		_hasChanges = false; 
		_changes = {};
		state = st; 
		return o; 
	}

	function hasChanges(){
		return _hasChanges; 
	}

	function changes(){
		return _changes;
	}

	o = {
		setState,
		$set,
		$get,
		hasChanges,
		changes
	};

	return o; 
}