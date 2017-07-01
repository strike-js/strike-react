declare global {
    interface Dictionary<T>{
        [idx:string]:T;
    }
}
/**
 * Represents an internal state used by the state container to emulate immutability. 
 */
export interface IManagedState<V> {
	/**
	 * Sets a specific attribute on the state. 
	 * @param {string} key the key to set its value. 
	 * @param {any} val the value of the state. 
	 * @returns {IManagedState} the managed state instance. Useful for chaining changes. 
	 */
	$set<T>(key:keyof V,val:T):this;
	/**
	 * Gets a specific attribute in the state. 
	 * @param {string} key the key to get its value. 
	 * @returns {any} the value at the provided key. 
	 */
	$get<T>(key:keyof V):T;
	/**
	 * Push a new element to a specific attribute 
	 */
	$push(key:keyof V,...args:any[]):this; 
	/**
	 * Removes an element from the beginning of an array 
	 */
	$shift<T>(key:keyof V):T; 
	/**
	 * Adds an item to the beginning of an array
	 */
	$unshift<T>(key:keyof V,val:T):this; 
	/**
	 * Remoes an element from the end of an array
	 */
	$pop<T>(key:keyof V):T;
	/**
	 * Removes an element at a specific position 
	 */
	$splice(key:keyof V,index:number,count?:number,...args:any[]); 
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
	 * Apply multiple mutations to the state
	 */
	withMutations(cb:(state:IManagedState<V>)=>void):void; 
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
export function createManagedState<V>(s?:Dictionary<any>):IManagedState<V>{
	let state:Dictionary<any> = s || null; 
	let _changes:Dictionary<any> = {};
	let o:IManagedState<V>; 
	let _hasChanges = false; 

	function $set<T>(key:keyof V,val:T):IManagedState<V>{
		if (state[key] !== val){
			_changes[key] = val; 
			_hasChanges = true;
		}
		return o; 
	}

	function $get<T>(key:keyof V){
		return state[key]; 
	}

	function $push(key:keyof V,...args:any[]):IManagedState<V>{
		let data:any = state[key]; 
		if (data && data.push && data.slice){
			let v = data.slice(0); 
			v.push(...args); 
			$set(key,v);  
		}
		return o; 
	}

	function withMutations(cb){
		cb(o); 
	}

	function $splice<T>(key:keyof V,index:number,count:number=1,...args:any[]):IManagedState<V>{
		let data:any = state[key]; 
		if (data && data.splice && data.slice){
			let v = data.slice(0); 
			v.splice(index,count,...args); 
			$set(key,v);  
		}
		return o; 
	}

	function $shift<T>(key:keyof V):T{
		let data:any = state[key]; 
		if (data && data.shift && data.slice){
			let v = data.slice(0); 
			var temp = v.shift(); 
			$set(key,v); 
			return temp; 
		}
		return;  
	}

	function $unshift<T>(key:keyof V,val:T):IManagedState<V>{
		let data:any = state[key]; 
		if (data && data.unshift && data.slice){
			let v = data.slice(0); 
			v.unshift(val); 
			$set(key,v);
		}
		return o; 
	}

	function $pop<T>(key:keyof V):T{
		let data:any = state[key]; 
		if (data && data.pop && data.slice){
			let v = data.slice(0); 
			var temp = v.pop(); 
			$set(key,v); 
			return temp; 
		}
		return;
	}



	function setState(st:Dictionary<any>){
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
		$push,
		$splice,
		$pop,
		$shift,
		$unshift,
		$get,
		withMutations,
		hasChanges,
		changes
	};

	return o; 
}