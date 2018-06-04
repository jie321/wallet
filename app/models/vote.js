import Request from '../utils/RequestUtil';
import {Producers} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

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
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }
        }
        
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
        }
    }
  }
  