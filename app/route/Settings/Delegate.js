import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import {EasyDialog} from '../../components/Dialog'
import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet}) => ({...wallet}))
class Nodevoting extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "投票锁仓",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },
        };
      };

    constructor(props) {
        super(props);
        this.state = {
            isAllSelected: true,  
            isNotDealSelected: false,        
        };
    }
    // 抵押
    delegatebw = () => {
        const view =
        <View style={{ flexDirection: 'row' }}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                secureTextEntry={true}
                keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>

        EasyDialog.show("密码", view, "确认", "取消", () => {

        if (this.state.password == "") {
            EasyToast.show('请输入密码');
            return;
        }
        EasyLoading.show();

        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);

                // 抵押
                Eos.transaction({
                    actions:[
                        {
                            account: 'eosio',
                            name: 'delegatebw',
                            authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                            }],
                            data:{
                                from: this.props.defaultWallet.account,
                                receiver: this.props.defaultWallet.account,
                                stake_net_quantity: "50 EOS",
                                stake_cpu_quantity: "50 EOS",
                                transfer: 0
                            }
                        }
                    ]
                }, plaintext_privateKey, (r) => {
                    EasyLoading.dismis();
                    if(r.data && r.data.transaction_id){
                        EasyToast.show("抵押成功");
                    }else if(r.data && JSON.parse(r.data).code != 0){
                        var jdata = JSON.parse(r.data);
                        var errmsg = "抵押失败: ";
                        if(jdata.error.details[0].message){
                            errmsg = errmsg + jdata.error.details[0].message;
                        }
                        alert(errmsg);
                    }

                    // alert(JSON.parse(r.data).code);
                }); 
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            // alert("-----------密码错误");
            EasyLoading.dismis();
            EasyToast.show('密码错误');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() }); 
    }

    undelegatebw = () => { 
            const view =
            <View style={{ flexDirection: 'row' }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
    
            EasyDialog.show("密码", view, "确认", "取消", () => {
    
            if (this.state.password == "") {
                EasyToast.show('请输入密码');
                return;
            }
            EasyLoading.show();

            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // alert("plaintext_privateKey "+plaintext_privateKey);

                    // 解除抵押
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'undelegatebw',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    from: this.props.defaultWallet.account,
                                    receiver: this.props.defaultWallet.account,
                                    unstake_net_quantity: "1000 EOS",
                                    unstake_cpu_quantity: "1000 EOS",
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        if(r.data && r.data.transaction_id){
                            EasyToast.show("解除抵押成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "解除抵押失败: ";
                            if(jdata.error.details[0].message){
                                errmsg = errmsg + jdata.error.details[0].message;
                            }
                            alert(errmsg);
                        }
                    }); 

                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                // alert("-----------密码错误");
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    };


 

     // 更新"全部/未处理/已处理"按钮的状态  
     _updateBtnSelectedState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
  
        let newState = {...this.state};  
  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        }  
    }  
  
    // 返回设置的button  
    _getButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isAllSelected', 'isNotDealSelected'];  
        return(  
            <View style={[style, selectedSate ? {backgroundColor: '#65CAFF'} : {backgroundColor: '#586888'}]}>  
                <Text style={[styles.tabText, selectedSate ? {color: 'white'} : {color: '#7787A3'}]}  onPress={ () => {this._updateBtnSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                    {buttonTitle}  
                </Text>  
            </View>  
        );  
    }  


    render() {
        return (
            <View style={styles.container}> 
                <View style={{paddingLeft: 15, paddingRight: 15,}}>
                    <View style={{paddingTop: 10, paddingBottom: 10,}}>
                        <View style={styles.frame}>
                            <Text style={styles.number}>1208</Text>
                            <Text style={styles.state}>EOS余额</Text>
                        </View>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>投票锁仓</Text>
                        </View>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>赎回中</Text>
                        </View>
                    </View> 
                    <View style={styles.tablayout}>  
                        {this._getButton(styles.buttontab, this.state.isAllSelected, 'isAllSelected', '投票锁仓')}  
                        {this._getButton(styles.buttontab, this.state.isNotDealSelected, 'isNotDealSelected', 'EOS赎回')}  
                    </View>  
                    <View style={{ paddingLeft: 20,  paddingTop: 40, paddingBottom: 60, justifyContent: 'center',}}>
                        <Text style={{ fontSize: 14, color: '#7787A3', lineHeight: 30, }}>{this.state.isAllSelected ? '投票锁仓':'EOS赎回'}</Text>
                        <View style={{flexDirection: 'row',  alignItems: 'center',  }}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.invite} returnKeyType="go" selectionColor="#65CAFF" style={{flex: 1, color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2, backgroundColor: '#FFFFFF', borderRadius: 5, }} placeholderTextColor="#8696B0" placeholder="" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8}
                                onSubmitEditing={() => this.regSubmit()}
                                onChangeText={(invite) => this.setState({ invite })}
                            />
                            <Text style={{ fontSize: 15, color: '#65CAFF', width: 50, textAlign: 'center'}}>全部</Text>
                        </View>
                    </View>
                    <Text style={{fontSize: 14, color: '#8696B0', lineHeight: 25,  }}>{this.state.isNotDealSelected ? '提示：解锁已经投票EOS可能会影响你的投票结果，一般投票三天后解锁不影响投票':'提示：在投票前必须将EOS划转至投票锁仓中，否则 无法进行投票。'}</Text>
                </View>
                <Button onPress={this.state.isAllSelected ? this.delegatebw.bind(): this.undelegatebw.bind()}>
                    <View style={{ margin: 10, height: 45,  borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#fff' }}>{this.state.isAllSelected ? '确定抵押':'确认赎回'}</Text>
                    </View>
                </Button>       
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingBottom: 40,
    },

    frame: {
        height:50, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomColor: '#586888', 
        borderBottomWidth: 1,
    },

    number: {
        flex: 2, 
        fontSize: 20, 
        color: '#FFFFFF', 
        textAlign: 'left', 
        paddingLeft: 8,
    },

    state: {
        flex: 1, 
        fontSize: 14, 
        color: '#7787A3', 
        textAlign: 'right', 
        paddingRight: 5,
    },

    tablayout: {   
        flexDirection: 'row',  
    },  

    buttontab: {  
        margin: 5,
        width: 100,
        height: 33,
        borderRadius: 15,
        alignItems: 'center',   
        justifyContent: 'center', 
    },  

    tabText: {  
       fontSize: 15,
    },  

    
});

export default Nodevoting;
