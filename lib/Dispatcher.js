"use strict";
var strikejs_util_1 = require("strikejs-util");
var ChangeStatus;
(function (ChangeStatus) {
    ChangeStatus[ChangeStatus["PENDING"] = 1] = "PENDING";
    ChangeStatus[ChangeStatus["EXECUTING"] = 2] = "EXECUTING";
    ChangeStatus[ChangeStatus["FINISHED"] = 3] = "FINISHED";
    ChangeStatus[ChangeStatus["OBSELETE"] = 4] = "OBSELETE";
})(ChangeStatus || (ChangeStatus = {}));
function createDispatcher() {
    var changePool = strikejs_util_1.createPool(function () {
        return {
            key: '',
            value: null,
            status: ChangeStatus.PENDING,
        };
    });
    strikejs_util_1.requestAnimationFramePolyfill();
    var changed = {};
    var list = [];
    var count = 0;
    var busy = false;
    function done() {
        busy = false;
        count--;
        if (list.length > 0) {
            exec();
        }
    }
    function exec() {
        busy = true;
        var item = null;
        while ((item = list.shift()) && item.status === ChangeStatus.OBSELETE) { }
        if (item) {
            requestAnimationFrame(function () {
                item.status = ChangeStatus.EXECUTING;
                item.value[0].setState(item.value[1], done);
            });
        }
    }
    function run(c, newState) {
        var key = c.getStateKey(), objs = changed[key], obj;
        obj = changePool.get();
        obj.status = ChangeStatus.PENDING;
        obj.value = [c, newState];
        if (!objs) {
            objs = changed[key] = [];
        }
        if (busy) {
            objs = objs.filter(function (e) {
                var ok = e.status === ChangeStatus.EXECUTING;
                if (!ok) {
                    e.status = ChangeStatus.OBSELETE;
                }
                return ok;
            });
            objs.push(obj);
            list.push(obj);
            return;
        }
        list.push(obj);
        exec();
        busy = true;
    }
    var o = {
        run: run,
    };
    return o;
}
