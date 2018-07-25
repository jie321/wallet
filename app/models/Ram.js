import Request from '../utils/RequestUtil';
import {getRamInfo, getRamPriceLine} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
let newarr = new Array();

export default {
    namespace: 'ram',
    state: {

    },
    effects: {
     *getRamInfo({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, "http://192.168.1.11:8088/api" + getRamInfo, 'post', payload);
            if(resp.code=='0'){               
                yield put({ type: 'updateInfo', payload: { ramInfo:resp.data } });
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
        try {
            if (callback) callback(resp);
        } catch (error) {
            if (callback) callback({ code: 500, msg: "网络异常" });
        }

     },
     *getRamPriceLine({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request, "http://192.168.1.11:8088/api" + getRamPriceLine + payload.type, 'post', payload);
            // alert("getRamPriceLine : " + JSON.stringify(resp));
            if(resp.code=='0'){               
                yield put({ type: 'updateRamPriceLine', payload: { data: resp.data, ...payload } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp);
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *clearRamPriceLine({ payload }, { call, put }) {
        try {
            yield put({ type: 'clearRamPriceLine', payload: { data: null } });
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
        }
    },
    },

    reducers : {
        updateInfo(state, action) {      
            return { ...state, ...action.payload };
        },
        updateRamPriceLine(state, action) {      
            let ramLineDatas = combine(action.payload.data);
            return { ...state, ramLineDatas };
        },
        clearRamPriceLine(state, action) {
            let ramLineDatas = null;
            return { ...state, ramLineDatas };
        },
    }
  }

  function combine(data) {
    return  {
        color: ['#556E95','#6CDAFF'],
        grid: {
            top: '15%',
            left: '0%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisTick: {
                    alignWithLabel: true
                },
                axisTick: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisLabel: {
                    color: "#96BAF0"
                },
            }
        ],
        yAxis: [
            {
                name: 'EOS/KB',
                nameLocation: 'end',      
                nameRotate: '0',
                nameGap: '10', 
                min: 'dataMin',
                max: 'dataMax',
                show: true,
                type: 'value',
                splitLine: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisTick: {
                    show: true,
                    // interval: '0'
                },
                axisLabel: {
                    show: true,
                    formatter: '{value}',
                    color: "#93B5EE",
                    // interval: '0'
                },
            },
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '交易量',
                type: 'line',
                barWidth: '50%',
                data: data.ps,
                lineStyle: {
                    normal: {
                        width: 2,  //连线粗细
                        color: "#6CDAFF"  //连线颜色
                    }
                },
                smooth: true,//折线图是趋缓的
            },
 
        ]
    }
}
  