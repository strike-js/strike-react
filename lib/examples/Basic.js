"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ControllerView_1 = require("../ControllerView");
var LocalStoragePersistentStrategy_1 = require("../LocalStoragePersistentStrategy");
var Store_1 = require("../Store");
var React = require("react");
var ReactDOM = require("react-dom");
var Dino = (function (_super) {
    __extends(Dino, _super);
    function Dino(p) {
        var _this = _super.call(this, p) || this;
        _this.onChange = _this.onChange.bind(_this);
        return _this;
    }
    Dino.prototype.onChange = function (e) {
        var el = e.currentTarget;
        this.props.onChange(el.value);
    };
    Dino.prototype.render = function () {
        return (React.createElement("div", { className: "bit" },
            React.createElement("div", { className: "input" },
                React.createElement("input", { type: "number", onChange: this.onChange, value: this.props.value }),
                this.props.name)));
    };
    return Dino;
}(React.Component));
function onChange(e) {
}
var Basic = (function (_super) {
    __extends(Basic, _super);
    function Basic(props) {
        var _this = _super.call(this, props) || this;
        _this.onChange = _this.onChange.bind(_this);
        _this.onClick = _this.onClick.bind(_this);
        return _this;
    }
    Basic.prototype.componentDidMount = function () {
        // console.log(this.props);
    };
    Basic.prototype.onClick = function () {
        this.props.store.dispatch({
            type: 1,
            data: 2222
        }).then(function () {
            console.log("the promise is resolved");
        });
    };
    Basic.prototype.onChange = function (txt) {
        this.props.store.dispatch(function (dispatch, getState) {
            return dispatch({
                type: 1,
                data: txt
            });
        }).then(function () {
            console.log("this is the function resolved: ");
        });
    };
    // componentWillReceiveProps(){
    //     this.props.dispatch(act2); 
    // }
    Basic.prototype.render = function () {
        var data = this.props.data;
        return (React.createElement("div", { className: "container" },
            React.createElement("div", { onClick: this.onClick }, "Click me"),
            React.createElement(Dino, { name: data.name, onChange: this.onChange, value: data.input })));
    };
    return Basic;
}(React.Component));
var cx = LocalStoragePersistentStrategy_1.localStorageStrategy();
var div = document.createElement('div');
document.body.appendChild(div);
var store = Store_1.createStore({
    ready: true,
    trackChanges: false,
    middlewares: []
});
var CV = ControllerView_1.createControllerView({
    component: Basic,
    propsToPropagate: ['namex'],
    initialState: function (props) {
        return {
            input: 10,
        };
    },
    propsToData: function (props, state) {
        return {
            name: props.namex
        };
    },
    reducer: function (state, action) {
        var input = state.$get('input');
        switch (action.type) {
            case 1:
                state.$set('input', input + 1);
                break;
            case 2:
                state.$set('input', input + 1000);
                break;
        }
    },
    stateKey: 'basic'
});
ReactDOM.render(React.createElement(CV, { store: store, namex: 'Suhail 2', injector: null, persistenceStrategy: cx }), div);
var i = 0;
var count = 0;
function act(dispatch, getState, box) {
    var k = getState('basic');
    console.log(k);
    store.dispatch({
        type: 1,
        data: i
    });
    store.dispatch({
        type: 1,
        data: i
    });
    setTimeout(function () {
        store.dispatch(act2);
        store.dispatch({
            type: 1,
            data: i
        });
        store.dispatch(act2);
    });
}
function act2(dispatch, getStaet, box) {
    store.dispatch({
        type: 1,
        data: i
    });
    new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 5000);
    })
        .then(function () {
        store.dispatch({
            type: 2,
            data: 1
        });
    });
    store.dispatch({
        type: 1,
        data: i
    });
}
function tick() {
    count++;
    if (count == 10) {
        i++;
        store.dispatch(act);
        count = 0;
    }
    // requestAnimationFrame(tick);
}
// requestAnimationFrame(tick);
setTimeout(function () {
    ReactDOM.unmountComponentAtNode(div);
}, 5000000);
