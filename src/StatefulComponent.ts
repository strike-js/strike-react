import {Reducer} from './Reducer'; 

/**
 * Represents a stateful component 
 */
export interface StatefulComponent<V,T> {
    /**
     * Set the state of the component  
     * @param {T} newState the new state or partial state
     */
    setState<T>(newState:T):void;
    /**
     * Set the state of the component 
     * @param {function} updater an updater function that receives the previous state, 
     * and the properties of the component and returns an object containing the changes 
     * that needs to be applied to the state. 
     */
    setState<T>(updater:(prevState:T,props:V)=>T,cb?:()=>void):void; 
    /**
     * Returns the state key of the component. This is used internally by the state container. 
     * @returns {string} 
     */
    getStateKey():string;
    /**
     * Returns the reducer of the component. This is used internally by the state container. 
     * @returns {Reducer} 
     */
    getReducer():Reducer;
    /**
     * The state of the component 
     */
    state:T; 
}
