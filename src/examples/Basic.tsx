import {createControllerView} from '../ControllerView'; 
import {localStorageStrategy} from '../LocalStoragePersistentStrategy'; 
import {createStore} from '../Store'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 

class Dino extends React.Component<any,any>{
    constructor(p){
        super(p);
        this.onChange = this.onChange.bind(this);
    }
    onChange(e){
        let el = e.currentTarget; 
        this.props.onChange(el.value); 
    }
    render(){
        return (
            <div className="bit">
                <div className="input">
                    <input type="number" onChange={this.onChange} value={this.props.value} />
                    {this.props.name}
                </div>
            </div>
        );
    }
}

function onChange(e:string){

}

class Basic extends React.Component<any,any>{
    constructor(props){
        super(props); 
        this.onChange = this.onChange.bind(this); 
        this.onClick = this.onClick.bind(this); 
    }

    componentDidMount(){
        // console.log(this.props);
    }

    onClick(){
        this.props.store.dispatch({ 
            type:1,
            data:2222
        }).then(()=>{
            console.log("the promise is resolved")
        });
    }

    onChange(txt:string){
        this.props.store.dispatch((dispatch,getState)=>{
            return dispatch({
                type:1,
                data:txt
            });
        }).then(()=>{
            console.log("this is the function resolved: ");
        });
    }

    // componentWillReceiveProps(){
    //     this.props.dispatch(act2); 
    // }

    render(){
        let {data} = this.props;
        return (
            <div className="container">
                <div onClick={this.onClick}>Click me</div>
                <Dino name={data.name} onChange={this.onChange} value={data.input} />

            </div>
        );
        
    }
}

let cx = localStorageStrategy(); 

let div = document.createElement('div'); 
document.body.appendChild(div); 
let store = createStore({
    ready:true,
    trackChanges:false,
    middlewares:[]
});

const CV = createControllerView({
    component:Basic,
    propsToPropagate:['namex'],
    initialState:(props)=>{
        return {
            input:10, 
        }
    },
    propsToData:(props,state:any)=>{
        return {
            name:props.namex
        };
    },
    reducer:(state,action)=>{
        var input = state.$get('input'); 
        switch(action.type){
            case 1:
            state.$set('input',input + 1);
            break;
            case 2:
            state.$set('input',input+1000); 
            break;
        }
    },
    stateKey:'basic'

});
ReactDOM.render(<CV store={store} namex='Suhail 2' injector={null} persistenceStrategy={cx} />,div);

var i = 0; 

var count = 0;

function act(dispatch,getState,box){
    var k = getState('basic');
    console.log(k);
    store.dispatch({
        type:1,
        data:i
    });
    store.dispatch({
        type:1,
        data:i
    });

    setTimeout(()=>{
        store.dispatch(act2); 
        store.dispatch({
            type:1,
            data:i
        });
        store.dispatch(act2);
    })
}

function act2(dispatch,getStaet,box){
    store.dispatch({
        type:1,
        data:i
    });
    new Promise((resolve)=>{
        setTimeout(()=>{
            resolve(); 
        },5000)
    })
    .then(()=>{
        store.dispatch({
            type:2,
            data:1
        });
    })
    store.dispatch({
        type:1,
        data:i
    });
}

function tick(){
    count++;
    if (count == 10){
        i++;
        store.dispatch(act);
        
        count = 0; 

    } 

    // requestAnimationFrame(tick);
}

// requestAnimationFrame(tick);

setTimeout(()=>{
    ReactDOM.unmountComponentAtNode(div);
},5000000);