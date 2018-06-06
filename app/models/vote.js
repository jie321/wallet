import Request from '../utils/RequestUtil';
import {Producers} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
let newarr = new Array();

export default {
    namespace: 'vote',
    state: {
        voteData:[],
        isChecked:false
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,Producers,"get");
            if(resp.code=='0'){               
                yield put({ type: 'updateVote', payload: { voteData:resp.data.rows } });
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },
     *up({payload},{call,put}) {
        try{
            yield put({ type: 'updateSelect', payload: { ...payload } });
            // alert('voteArr'+JSON.stringify(payload));
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },
     *addvote({payload},{call,put}) {
     alert('voteArr'+JSON.stringify(payload));
        try{
            yield put({ type: 'votedateAdd', payload: { ...payload } });
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },
           
    },
    reducers : {
        updateVote(state, action) {
            return {...state,voteData:action.payload.voteData}; 
        },
        updateSelect(state, action) {
            let dts = state.voteData;
            let newarr = new Array();
            dts.map((item)=>{
                if(item==action.payload.item){
                    if(item.isChecked){
                        item.isChecked=false;
                    }else{
                        item.isChecked=true;
                    }
                }
                newarr.push(item);
            })
            return {...state,voteData:newarr}; 
        },
        votedateAdd(state, action) {
            alert('votedateAdd'+JSON.stringify(action));
           
            EasyToast.show("开始投票1----");
            Eos.transaction({
                actions:[
                    {
                        account: 'eosio',
                        name: 'voteproducer',
                        authorization: [{
                            actor: 'morning',//账号名称
                            permission: 'active'
                        }],
                        data:{
                            voter: 'morning', //账号名称
                            proxy: '',
                            producers: ["producer111e"] //被选中节点名称
                        }
                    }
                ]
            }, "5KbZaYcBmVFtbVZFnurPMPLiuQvieuZMQJgbqzQvz2Z6QsXSh8Z", (r) => { // 账号私钥
                EasyLoading.dismis();
                alert('asdfsadf');
                alert(JSON.stringify(r.data))}); 
        },
        
    }
  }
  