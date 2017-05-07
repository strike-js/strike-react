"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A middleware to handle websocket communication.
 * @param {WebSocket} websocket the websocket to connect to.
 * @param {IStore} store the state container instance.
 * @returns {IMiddleware} the websocket middleware.
 */
function WebSocketMiddleware(websocket, store) {
    websocket.addEventListener('open', function (e) {
        store.dispatch({
            type: 'WebsocketActionOpen',
            data: 1
        });
    });
    websocket.addEventListener('message', function (e) {
        store.dispatch({
            type: 'WebsocketActionMessage',
            data: JSON.parse(e.data)
        });
    });
    websocket.addEventListener('error', function (e) {
        store.dispatch({
            type: 'WebsocketActionError',
            data: e.returnValue
        });
    });
    websocket.addEventListener('close', function (e) {
        store.dispatch({
            type: 'WebsocketActionClose',
            data: {
                reason: e.reason,
                code: e.code,
                wasClean: e.wasClean
            }
        });
    });
    return function (action, store, next) {
        if (action.websocket) {
            if (action.websocket === "close") {
                websocket.close();
                next();
            }
            else if (action.websocket === "send") {
                websocket.send(JSON.stringify(action));
                next();
            }
            next();
        }
        next(action);
    };
}
exports.WebSocketMiddleware = WebSocketMiddleware;
