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
        });
    }

    onChange(txt:string){
        this.props.store.dispatch({
            type:1,
            data:txt
        });
    }

    render(){
        let {data} = this.props;
        return (
            <div className="container">
                <div onClick={this.onClick}>Click me</div>
                <Dino onChange={this.onChange} value={data.input} />

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
    initialState:{
        name:'Borqa',
        input:0,
    },
    reducer:(state,action)=>{
        state.$set('input',action.data);
    },
    stateKey:'basic'

});
ReactDOM.render(<CV store={store} injector={null} persistenceStrategy={cx} />,div);

var i = 0; 

var count = 0; 

function tick(){
    count++;
    if (count === 2){
        i++;
        store.dispatch({
            type:1,
            data:i
        });
        count = 0; 

    } 

    requestAnimationFrame(tick);
}

// requestAnimationFrame(tick);

setTimeout(()=>{
    ReactDOM.unmountComponentAtNode(div);
},10000);