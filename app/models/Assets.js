import Request from '../utils/RequestUtil';
import {pocketAsset,} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'assets',
    state: {
        assetsData:{},
        newsRefresh:false,
        updateTime:"",
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            if(payload.page==1){
                yield put({type:'upstatus',payload:{newsRefresh:true}});
            }
            const resp = yield call(Request.request,pocketAsset, 'post', payload);
            if(resp.code=='0'){
                let dts = new Array();
                resp.data.map((item)=>{
                    item.row=3;
                    dts.push(item);
                });
                yield put({type:'update',payload:{data:dts,...payload}});
            }else{
                EasyToast.show(resp.msg);
            }
            yield put({type:'upstatus',payload:{newsRefresh:false}});
        } catch (error) {
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            EasyToast.show('网络发生错误，请重试');
        }
      },
    
      *view({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,newsView+payload.news.id,'get');
            if(resp.code==0){
                payload.news.view=payload.news.view+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *share({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,newsShare+payload.news.id,'get');
            if(resp.code==0){
                payload.news.share=payload.news.share+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *openView({payload},{call,put}) {
        yield put({type:'open',...payload});
      },
    },
   
    reducers: {
        update(state, action) {
            // alert('update: '+JSON.stringify(action));
            let assetsData = action.payload.data;
            // if(action.payload.page==1){
            //     assetsData[action.payload.type]=action.payload.data;
            // }else{
            //     assetsData[action.payload.type]= assetsData[action.payload.type].concat(action.payload.data)
            // }
            return {...state,assetsData,updateTime:Date.parse(new Date())};
        },
        open(state, action) {
            
            let assetsData = state.assetsData;

            let dts = new Array();
           
            assetsData[action.key].map((item)=>{
                if(item.id==action.nid){
                    if(item.row==3){
                        item.row=1000;
                    }else{
                        item.row=3;
                    }
                }
                dts.push(item);
            });
            assetsData[action.key]=dts;

            return {...state,assetsData,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateAction(state,action){
            let n = action.news;
            let assetsData = state.assetsData;
            let list = assetsData[n.tid];
            list.map((item, i) => {
                if(item.id==n.id){
                    item=n;  
                                    
                }
            })
            state.something = Date.parse(new Date());
            assetsData[n.tid] = list;
            return {...state,assetsData};
        },

     
        
    }
  }
  