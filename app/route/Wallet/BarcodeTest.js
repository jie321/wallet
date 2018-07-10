/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    DeviceEventEmitter,
    View,
    Alert
} from 'react-native';
import Barcode from 'react-native-smart-barcode'

import { EasyToast } from '../../components/Toast';

import PropTypes from 'prop-types'

import BaseComponent from "../../components/BaseComponent";

export default class App extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
    }

    static navigationOptions = {
        title: '扫码转账'
      };


    //构造方法
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
            show: false,
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
        };
    }
    componentDidMount() {
        //启动定时器
        this.timer = setTimeout(
            () => this.setState({ viewAppear: true }),
            250
        );
    }
    //组件销毁生命周期
    componentWillUnmount() {
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        //清楚定时器
        this.timer && clearTimeout(this.timer);
    }

    _onBarCodeRead = (e) => {
        // console.log(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`)
        this._stopScan();
        try {
            var strcoins = e.nativeEvent.data.code;
            if(strcoins == undefined || strcoins == null){
                EasyToast.show('无效的二维码');
                return;
            }
            var length = strcoins.length;
            var index = strcoins.lastIndexOf("eos:");
            if (index == 0) {
                index += 4; //"eos:"
                var point = strcoins.lastIndexOf("?");
                if(point <= index || point >= length)
                {
                    EasyToast.show('无效的二维码');
                    return;
                }
                var account = strcoins.substring(index,point);
                if(account == undefined || account == null || account == ""){
                    EasyToast.show('无效的二维码');
                    return;
                }
                index = point + 1; //"?"
                var pointamount = strcoins.lastIndexOf("amount=");    
                if(index != pointamount || pointamount >= length){
                    EasyToast.show('无效的二维码');
                    return;
                }
                index += 7; //"amount="
                var point2 = strcoins.lastIndexOf("&");    
                if(point2 <= index || point2 >= length){
                    EasyToast.show('无效的二维码');
                    return;
                }
                var amount = strcoins.substring(index,point2);
                if(amount == undefined || amount == null){
                    EasyToast.show('无效的二维码');
                    return;
                }
                index = point2 + 1; //"&"
                var pointtoken = strcoins.lastIndexOf("token=");   
                if(index != pointtoken || pointtoken >= length){
                    EasyToast.show('无效的二维码');
                    return;
                } 
                index += 6; //"token="
                var symbol = strcoins.substring(index,length);
                if(symbol == null || symbol != 'EOS')
                {
                    EasyToast.show('无效的二维码');
                    return;
                }
                var jsoncode = '{"toaccount":"' + account + '","amount":"' + amount + '","symbol":"EOS"}';
                // // coins.name = coins.symbol;
                 var coins = JSON.parse(jsoncode);

                this.props.navigation.goBack();
                if(this.state.isTurnOut){
                    DeviceEventEmitter.emit('scan_result',coins);
                }else{
                    const { navigate } = this.props.navigation;
                    navigate('TurnOut', { coins: coins });
                }
                
            } else {
                 //兼容上一版本
                 var coins = JSON.parse(e.nativeEvent.data.code);
                 if (coins.toaccount != null) {
                     coins.name = coins.symbol;
                     this.props.navigation.goBack();
                     if(this.state.isTurnOut){
                         DeviceEventEmitter.emit('scan_result',coins);
                     }else{
                         const { navigate } = this.props.navigation;
                         navigate('TurnOut', { coins: coins });
                     }
                 } else {
                     EasyToast.show('无效的二维码');
                 }
            }
        } catch (error) {
            EasyToast.show('无效的二维码');
        }
        // Alert.alert("二维码", e.nativeEvent.data.code, [
        //     {text: '确认', onPress: () => this._startScan()},
        // ])
    };

    _startScan = (e) => {
        this._barCode.startScan()
    };

    _stopScan = (e) => {
        this._barCode.stopScan()
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.viewAppear ?
                    <Barcode style={{ flex: 1, }} ref={component => this._barCode = component}
                        onBarCodeRead={this._onBarCodeRead} />
                    : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});