import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity, ImageBackground} from 'react-native';
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
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Network extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "计算资源",
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
            delegatebw: "",
            undelegatebw: "",
            receiver: "",
            balance: '0',
        };
    }

    componentDidMount() {
        EasyLoading.show();
        this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {  
                EasyLoading.dismis();
                }}); 
    }

    // 抵押
    delegatebw = () => {
        if ((this.state.delegatebw == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }

        // alert("this.state.invite" + this.state.invite);
        // if(this.state.invite > this.props.navigation.state.params.balance) {
           
        //         EasyToast.show('输入抵押的EOS数量不能大于EOS余额');
           
        //     return;
        // }


        const view =
        <View style={{ flexDirection: 'column', alignItems: 'center', }}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                secureTextEntry={true}
                keyboardType="ascii-capable" style={{ color: '#65CAFF', height: 45, width: 160, paddingBottom: 5, fontSize: 16, backgroundColor: '#FFF', borderBottomColor: '#586888', borderBottomWidth: 1, }}
                placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={{ fontSize: 14, color: '#808080', lineHeight: 25, marginTop: 5,}}>提示：抵押 {this.state.delegatebw} EOS</Text>
        </View>

        EasyDialog.show("请输入密码", view, "确认", "取消", () => {

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
                                stake_net_quantity: this.state.delegatebw + " EOS",
                                stake_cpu_quantity: "0 EOS",
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
                        EasyToast.show(errmsg);
                    }

                    // alert(JSON.parse(r.data).code);
                }); 
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyLoading.dismis();
            EasyToast.show('密码错误');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() }); 
    }

    undelegatebw = () => { 
        if ((this.state.undelegatebw == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }

            const view =
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', height: 45, width: 160, paddingBottom: 5, fontSize: 16, backgroundColor: '#FFF', borderBottomColor: '#586888', borderBottomWidth: 1,  }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={{ fontSize: 14, color: '#808080', lineHeight: 25, marginTop: 5,}}>提示：赎回 {this.state.undelegatebw} EOS</Text>
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
    
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
                                    unstake_net_quantity: this.state.undelegatebw + " EOS",
                                    unstake_cpu_quantity: "0 EOS",
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
        // balance = balance.replace("EOS", "");

        return (
            <View style={styles.container}> 
                <ScrollView >
                  <ImageBackground  style={{ justifyContent: "center", alignItems: 'center', flexDirection:'column', height: 140, }} source={UImage.resources_bj} resizeMode="stretch">
                    <View style={{justifyContent: "center", alignItems: 'center', flexDirection:'row', flex: 1, paddingTop: 5,}}>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>抵押（EOS）</Text>
                        </View>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>赎回中（EOS）</Text>
                        </View>
                    </View> 
                    <View style={{justifyContent: "center", alignItems: 'center', flexDirection:'row', flex: 1, paddingTop: 5,}}>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>占用</Text>
                        </View>
                        <View style={styles.frame}>
                            <Text style={styles.number}>0</Text>
                            <Text style={styles.state}>可用</Text>
                        </View>
                    </View> 
                  </ImageBackground>  
                    <View style={styles.tablayout}>  
                        {this._getButton(styles.buttontab, this.state.isAllSelected, 'isAllSelected', '自己购买')}  
                        {this._getButton(styles.buttontab, this.state.isNotDealSelected, 'isNotDealSelected', '购买送人')}  
                    </View>  
                    <View style={{ padding: 20,  justifyContent: 'center',}}>
                        <Text style={{ fontSize: 14, color: '#7787A3', lineHeight: 35, }}>资产抵押（EOS）</Text>
                        <View style={{flexDirection: 'row',  alignItems: 'center',  }}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegatebw} returnKeyType="go" selectionColor="#65CAFF" style={{flex: 1, color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10, backgroundColor: '#FFFFFF', borderRadius: 5, }} placeholderTextColor="#8696B0" placeholder="输入抵押金额" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8}
                                onChangeText={(delegatebw) => this.setState({ delegatebw })}
                            />
                            <Button onPress={this.delegatebw.bind()}>
                                <View style={{ marginLeft: 10, width: 86, height: 38,  borderRadius: 3, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, color: '#fff' }}>抵押</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>
                    <View style={{ padding: 20,  justifyContent: 'center',}}>
                        <Text style={{ fontSize: 14, color: '#7787A3', lineHeight: 35, }}>取消抵押（EOS）</Text>
                        <View style={{flexDirection: 'row',  alignItems: 'center',  }}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.undelegatebw} returnKeyType="go" selectionColor="#65CAFF" style={{flex: 1, color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10, backgroundColor: '#FFFFFF', borderRadius: 5, }} placeholderTextColor="#8696B0" placeholder="输入取消抵押金额" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8}
                                onChangeText={(undelegatebw) => this.setState({ undelegatebw })}
                            />
                            <Button onPress={this.undelegatebw.bind()}>
                                <View style={{ marginLeft: 10, width: 86, height: 38,  borderRadius: 3, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, color: '#fff' }}>解除</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>
                    <View style={{padding: 20,}}>
                        <Text style={{fontSize: 12, color: '#8696B0', lineHeight: 25,  }}>重要提示</Text>
                        <Text style={{fontSize: 12, color: '#8696B0', lineHeight: 25,  }}>1.获取资源需要抵押EOS；</Text>
                        <Text style={{fontSize: 12, color: '#8696B0', lineHeight: 25,  }}>2.抵押的EOS可以撤销抵押，并于3天后退回；</Text>
                        <Text style={{fontSize: 12, color: '#8696B0', lineHeight: 25,  }}>3.主网投票进度未满15%时，无法撤销抵押；</Text>
                    </View>
                </ScrollView>   
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },

    frame: {
        flex: 1,
        flexDirection: 'column', 
        // alignItems: 'center', 
        justifyContent: "center",
    },

    number: {
        flex: 2, 
        fontSize: 24, 
        color: '#FFFFFF', 
        textAlign: 'center',  
    },

    state: {
        flex: 1, 
        fontSize: 12, 
        color: '#FFFFFF', 
        textAlign: 'center',     
    },

    tablayout: {   
        flexDirection: 'row',  
        borderBottomColor: '#586888',
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 5,
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

export default Network;
