import Request from '../utils/RequestUtil';
import {listProducers, getAccountInfo, getUndelegatebwInfo, listAgent} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
let newarr = new Array();

export default {
    namespace: 'vote',
    state: {
        voteData:[],
        isChecked:false,
        accountInfo:[]
    },
    effects: {
     *list({payload},{call,put}) {
        try{
            const resp = yield call(Request.requestO, "http://192.168.1.76:8088/api" + listAgent,"post");
            //  alert('listAgent ：'+JSON.stringify(resp));
            // const resp = yield call(Request.request,listAgent,"get");
            if(resp.code=='0'){               
                yield put({ type: 'updateVote', payload: { voteData:resp.data } });
                // yield put({ type: 'updateVote', payload: { AgentData:resp.data } });
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
            // alert(''+JSON.stringify(payload));
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },
     /**
      *  获取eos账户信息 获取账户投票信息
      */
     *getaccountinfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getAccountInfo, 'post', payload);
            // alert("getaccountinfo : " + JSON.stringify(resp));
            if(resp.code=='0'){               
                yield put({ type: 'updateAccountInfo', payload: { producers:(resp.data.voter_info ? resp.data.voter_info.producers : "") } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp.data);
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },

    /**
      *  获取eos赎回信息
      */
     *getundelegatebwInfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getUndelegatebwInfo, 'post', payload);
            // alert("getundelegatebwInfo : " + JSON.stringify(resp));
            if(resp.code=='0'){               
                // yield put({ type: 'updateAccountInfo', payload: { accountInfo:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp.data);
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
        updateAccountInfo(state, action) {    
                // alert("updateAccountInfo : " + JSON.stringify(action.payload.producers));
            let arr = state.voteData;
            let arr1 = [];
            for(var i = 0; i < arr.length; i++){
                for(var j = 0; j < action.payload.producers.length; j++){
                    if(action.payload.producers[j] == (arr[i].account)){
                        arr1.push(arr[i]);
                       }
                }
            }
            // alert("updateAccountInfo1 : " + JSON.stringify(arr1));
            return {...state, producers: arr1};      
        }, 
    }
  }
  