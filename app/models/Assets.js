import Request from '../utils/RequestUtil';
import {pocketAsset, getBalance, submitAssetInfo, listAssets, addAssetToServer} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import { DeviceEventEmitter } from 'react-native';

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
            const resp = yield call(Request.requestO, "http://192.168.1.66:8088/api" + listAssets, 'post', payload);
            // alert(JSON.stringify(resp));
            if(resp.code=='0'){
                let dts = new Array();
                resp.data.map((item)=>{
                    item.row=3;
                    dts.push(item);
                });
                yield put({type:'updateAssetList',payload:{assetsList:dts,...payload}});
            }else{
                EasyToast.show(resp.msg);
            }
            yield put({type:'upstatus',payload:{newsRefresh:false}});
        } catch (error) {
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            EasyToast.show('网络繁忙,请稍后!');
        }
      },
     *myAssetInfo({payload, callback},{call,put}){
        var myAssets = yield call(store.get, 'myAssets');
        if(myAssets == null || myAssets.length == 0){ // 未有资产信息时默认取eos的
            var myAssets = [];
            // 单独获取eos信息
            var eosInfoDefault = {
                asset: {name : "EOS", icon: "http://static.eostoken.im/images/20180319/1521432637907.png", contractAccount: "eosio.token", value: "0.00"},
                value: true,
                balance: '0.0000',
            }
            const resp = yield call(Request.requestO, "http://192.168.1.66:8088/api" + listAssets, 'post', {code: 'EOS'});
            alert(JSON.stringify(resp));
            if(resp.code == '0' && resp.data && resp.data.length == 1){
                var eosInfo = {
                    asset: resp.data[0],
                    value: true,
                    balance: '0.0000',
                }
                myAssets[0] = eosInfo;
            }else{
                myAssets[0] = eosInfoDefault;
            }
            yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        }else{
            for(var i = 0; i < myAssets.length; i++){
                const resp = yield call(Request.requestO, "http://192.168.1.66:8088/api" + listAssets, 'post', {code: myAssets[i].asset.name});
                if(resp.code == '0' && resp.data && resp.data.length == 1){
                    var assetInfo = {
                        asset: resp.data[0],
                        value: true,
                        balance: '0.0000',
                    }
                    myAssets[i] = assetInfo;
                }
            }
            yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        }

        yield call(store.save, 'myAssets', myAssets);

        if(callback){
            callback(myAssets);
        }

    },
    *updateMyAsset({payload},{call,put}){
        var myAssets = yield call(store.get, 'myAssets');
        alert(JSON.stringify(payload) + "   " +JSON.stringify(myAssets));
        if (myAssets == null) {
            myAssets = [];
        }
        for (var i = 0; i < myAssets.length; i++) {
            if (myAssets[i].asset.name == payload.asset.name) {
                // 删除资产
                myAssets.splice(i, 1);
            }
        }

        // 添加资产
        var _asset = {
            asset: payload.asset,
            value: true,
            balance: payload.balance,
        }
        myAssets[myAssets.length] = _asset;
        yield call(store.save, 'myAssets', myAssets);
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
     },
     *getBalance({payload, callback}, {call, put}){
        try{
            // alert("------ " + JSON.stringify(payload));
            var myAssets = yield call(store.get, 'myAssets');
            for(let i in myAssets){
                let item = myAssets[i];
                const resp = yield call(Request.request, getBalance, 'post', {contract: item.asset.contractAccount, account: payload.accountName, symbol: item.asset.name});
                // alert("------ " + JSON.stringify(resp));
                if(resp && resp.code=='0'){
                    item.balance = resp.data;
                }
            }
            yield call(store.save, 'myAssets', myAssets);
            yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
            if(callback){
                callback(myAssets);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
    },
    *addMyAsset({payload, callback},{call,put}){
        var myAssets = yield call(store.get, 'myAssets');
        // alert(JSON.stringify(payload.asset) + "   " +JSON.stringify(myAssets));
        if (myAssets == null) {
            var  myAssets = [];
        }
        for (var i = 0; i < myAssets.length; i++) {
            if (myAssets[i].asset.name == payload.asset.name) {
                if(payload.value){ // 添加资产,  但资产已存在
                    return;
                }else{ // 删除资产
                    myAssets.splice(i, 1);
                    yield call(store.save, 'myAssets', myAssets);
                    yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
                    if(callback) callback(myAssets);
                    // DeviceEventEmitter.emit('updateMyAssets', payload);
                    return;
                }
            }
        }

        // 如果目前我的资产没有传入的资产
        if(!payload.value){ // 删除资产直接退出
            return;
        }

        // 添加资产
        var _asset = {
            asset: payload.asset,
            value: payload.value,
            balance: '0.0000',
        }
        myAssets[myAssets.length] = _asset;
        yield call(store.save, 'myAssets', myAssets);
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        if(callback) callback(myAssets);
        // DeviceEventEmitter.emit('updateMyAssets', payload);
     },
    *submitAssetInfoToServer({payload, callback},{call,put}){
        try{
            const resp = yield call(Request.request, submitAssetInfo, 'post', {contract_account: payload.contractAccount, name: payload.name});
            if(resp && resp.code=='0'){
                DeviceEventEmitter.emit('updateAssetList', payload);
            }
            if(callback){
                callback(resp);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
     },

    },

    reducers: {
        updateAssetList(state, action) {
            let assetsList = action.payload.assetsList;
            return {...state,assetsList,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateMyAssets(state, action) {
            return { ...state, ...action.payload };
        },
        updateEosInfo(state, action) {
            return {...state, ...action.payload};
        }
    }
  }
  