import {Action} from './Action'; 
import {IMiddleware,IMiddlewareNext} from './Middleware'; 
import {IStore} from './Store'; 

/**
 * Represents an action to be handled by a worker middleware. 
 */
export interface WebSocketAction extends Action {
    websocket:"close"|"send";
    websocketId?:string;
}

/**
 * A middleware to handle websocket communication. 
 * @param {WebSocket} websocket the websocket to connect to. 
 * @param {IStore} store the state container instance. 
 * @returns {IMiddleware} the websocket middleware. 
 */
export function WebSocketMiddleware (websocket:WebSocket,store:IStore):IMiddleware{
    websocket.addEventListener('open',function(e){
        store.dispatch({
            type:'WebsocketActionOpen',
            data:1
        });
    });
    websocket.addEventListener('message',function(e){
        store.dispatch({
            type:'WebsocketActionMessage',
            data:JSON.parse(e.data)
        });
    });
    websocket.addEventListener('error',function(e){
        store.dispatch({
            type:'WebsocketActionError',
            data:e.returnValue
        });
    });
    websocket.addEventListener('close',function(e){
        store.dispatch({
            type:'WebsocketActionClose',
            data:{
                reason:e.reason,
                code:e.code,
                wasClean:e.wasClean
            }
        });
    });

    return function(action:WebSocketAction,store:IStore,next:IMiddlewareNext){
        if (action.websocket){
            if (action.websocket === "close"){
                websocket.close();
                next(); 
            }else if (action.websocket === "send"){
                websocket.send(JSON.stringify(action));
                next(); 
            }
            next(); 
        }
        next(action);
    }
}