import Request from '../utils/RequestUtil';
import {listProducers, getAccountInfo, getVotingInfo} from '../utils/Api';
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
            const resp = yield call(Request.request,listProducers,"get");
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
     /**
      *  获取eos账户信息
      */
     *getaccountinfo({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,getAccountInfo, 'post', payload);
            alert("getaccountinfo: " + JSON.stringify(resp));
            if(resp.code=='0'){               
                yield put({ type: 'updateAccountInfo', payload: { accountInfo:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
     },
         /**
      *  获取账户投票信息
      */
     *getvotinginfo({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,getVotingInfo, 'post', payload);
            alert("getVotingInfo: " + JSON.stringify(resp));
            if(resp.code=='0'){               
                yield put({ type: 'updateVotingInfo', payload: { votingInfo:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
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
            return {...state, ...action.payload};
        }, 
        updateVotingInfo(state, action) {
            return {...state, ...action.payload};
        }, 
    }
  }
  