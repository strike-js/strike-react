import {Reducer} from './Reducer'; 

export interface StatefulComponent<T> {
    setState(newState:any); 
    getStateKey():string;
    getReducer():Reducer;
    setState(state:T,onDone?:()=>void):void;
    state:T; 
}
