import {StatefulComponent} from './StatefulComponent';
import {createPool,Dictionary,requestAnimationFramePolyfill} from 'strikejs-util';

interface Dispatcher {
	run(c:StatefulComponent<any>,newState:any);
}

enum ChangeStatus {
	PENDING = 1, 
	EXECUTING = 2,
	FINISHED = 3,
	OBSELETE = 4,
}

interface StateChange {
	key:string;
	value:any;
	status:ChangeStatus;
}

function createDispatcher():Dispatcher{
	let changePool = createPool<StateChange>(function(){
		return {
			key:'',
			value:null,
			status:ChangeStatus.PENDING,
		};
	});
	requestAnimationFramePolyfill();
	var changed:Dictionary<StateChange[]> = {};
	var list = [];  
	var count = 0; 
	var busy = false; 
	function done(){
		busy = false; 
		count--; 
		if (list.length > 0){
			exec();
		}
	}

	function exec(){
		busy = true; 
		let item:StateChange = null;
		while((item = list.shift()) && item.status === ChangeStatus.OBSELETE){}
		if (item){
			requestAnimationFrame(()=>{
				item.status = ChangeStatus.EXECUTING;
				item.value[0].setState(item.value[1],done);  
			});
		}
	}

	function run(c:StatefulComponent<any>,newState:any){
		let key = c.getStateKey(), objs = changed[key], obj:StateChange;
		obj = changePool.get(); 
		obj.status = ChangeStatus.PENDING;
		obj.value = [c,newState]; 
		if (!objs){
			objs = changed[key] = []; 
		}
		if (busy){
			objs = objs.filter((e)=>{
				let ok = e.status === ChangeStatus.EXECUTING;
				if (!ok){
					e.status = ChangeStatus.OBSELETE;
				}
				return ok
			});
			objs.push(obj);
			list.push(obj);
			return; 
		}
		list.push(obj); 
		exec(); 
		busy = true; 
		
	}

	let o = {
		run,
	};  

	return o;
}