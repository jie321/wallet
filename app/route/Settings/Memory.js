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
class Memory extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "内存资源",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },
        };
      };

    constructor(props) {
        super(props);
        this.state = {
            isBuyOneself: true,  
            isBuyForOther: false,  
            receiver: "",
            buyRamAmount: "",
            sellRamBytes: "",
            password: "",
            balance: '0',
            used: '0',
            available: '0',
        };
    }

    getAccountInfo(){
        this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
            // alert("----------" + JSON.stringify(data));
            this.setState({
                used:(data.ram_usage / 1024).toFixed(3),
                available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(3),
            });
        } });
    } 
    
    componentDidMount() {
        EasyLoading.show();
        this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {  
            this.getAccountInfo();
            EasyLoading.dismis();
        }});   
    }

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
        let BTN_SELECTED_STATE_ARRAY = ['isBuyOneself', 'isBuyForOther'];  
        return(  
            <View style={[style, selectedSate ? {backgroundColor: '#65CAFF'} : {backgroundColor: '#586888'}]}>  
                <Text style={[styles.tabText, selectedSate ? {color: 'white'} : {color: '#7787A3'}]}  onPress={ () => {this._updateBtnSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                    {buttonTitle}  
                </Text>  
            </View>  
        );  
    }  

    buyram = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

        if(this.state.buyRamAmount == ""){
            EasyToast.show('请输入购买金额');
            return;
        }
            const view =
            <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', height: 45, width: 160, paddingBottom: 5, fontSize: 16, backgroundColor: '#FFF', borderBottomColor: '#586888', borderBottomWidth: 1, }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={{ fontSize: 14, color: '#808080', lineHeight: 25, marginTop: 5,}}></Text>  
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

                    if(this.state.isBuyOneself){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    // alert("isBuyOneself: " + this.state.isBuyOneself + " receiver: "+this.state.receiver+" amount: " + this.state.buyRamAmount + " account: "+this.props.defaultWallet.account);

                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'buyram',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    payer: this.props.defaultWallet.account,
                                    receiver: this.state.receiver,
                                    quant:  this.state.buyRamAmount + " EOS", //["producer111f"]
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        // alert(JSON.stringify(r.data));
                        if(r.data && r.data.transaction_id){
                            this.getAccountInfo();
                            EasyToast.show("购买内存成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "购买内存失败: ";
                            if(jdata.error.details[0].message){
                                errmsg = errmsg + jdata.error.details[0].message;
                            }
                            EasyToast.show(errmsg);
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

    sellram = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

        if(this.state.sellRamBytes == ""){
            EasyToast.show('请输入出售内存字节数量');
            return;
        }

            const view =
            <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', height: 45, width: 160, paddingBottom: 5, fontSize: 16, backgroundColor: '#FFF', borderBottomColor: '#586888', borderBottomWidth: 1, }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={{ fontSize: 14, color: '#808080', lineHeight: 25, marginTop: 5,}}></Text>  
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

                    // alert("receiver: "+this.props.defaultWallet.account+" " + "sellBytes: " + this.state.sellRamBytes);
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'sellram',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    account: this.props.defaultWallet.account,
                                    bytes: this.state.sellRamBytes,
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        // alert(JSON.stringify(r.data));
                        if(r.data && r.data.transaction_id){
                            this.getAccountInfo();
                            EasyToast.show("出售内存成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "出售内存失败: ";
                            if(jdata.error.details[0].message){
                                errmsg = errmsg + jdata.error.details[0].message;
                            }
                            EasyToast.show(errmsg);
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

    render() {
        // balance = balance.replace("EOS", "");

        return (
            <View style={styles.container}> 
                <ScrollView keyboardShouldPersistTaps="always">
                  <ImageBackground  style={styles.headbj} source={UImage.resources_bj} resizeMode="stretch">
                    <View style={styles.frameoutsource}>
                        <View style={styles.frame}>
                            <Text style={styles.number}>{this.state.used}</Text>
                            <Text style={styles.state}>已使用（KB）</Text>
                        </View>
                        <View style={styles.frame}>
                            <Text style={styles.number}>{this.state.available}</Text>
                            <Text style={styles.state}> 可用（KB）</Text>
                        </View>
                    </View> 
                    <View style={styles.headoutsource}>
                        <Text style={styles.headText}>*内存资源，可以使用EOS买入，也可以卖出获得EOS</Text>
                    </View> 
                  </ImageBackground>  
                    <View style={styles.tablayout}>  
                        {this._getButton(styles.buttontab, this.state.isBuyOneself, 'isBuyOneself', '购买')}  
                        {this._getButton(styles.buttontab, this.state.isBuyForOther, 'isBuyForOther', '赠人')}  
                    </View>  
                    {this.state.isBuyOneself ? null:
                    <View style={{ padding: 20,  justifyContent: 'center',}}>
                        <Text style={styles.inptTitle}>注：只限EOS账号，一旦送出可能无法收回！</Text>
                        <View style={styles.outsource}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.receiver} 
                            returnKeyType="go" selectionColor="#65CAFF" style={styles.inpt} placeholderTextColor="#8696B0" 
                            placeholder="输入接受账号" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                            onChangeText={(receiver) => this.setState({ receiver })}
                            />
                            <Button >
                                <View style={styles.botnimg}>
                                    <Image source={UImage.al} style={{width: 26, height: 26, }} />
                                </View>
                            </Button> 
                        </View>
                    </View>
                    }
                    <View style={styles.inptoutsource}>
                        <Text style={styles.inptTitle}>购买内存（0.0000 EOS）</Text>
                        <View style={styles.outsource}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} 
                            returnKeyType="go" selectionColor="#65CAFF" style={styles.inpt} placeholderTextColor="#8696B0" 
                            placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                            onChangeText={(buyRamAmount) => this.setState({ buyRamAmount })}
                            />
                            <Button onPress={this.buyram.bind()}>
                                <View style={styles.botn}>
                                    <Text style={styles.botText}>购买</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>
                    {this.state.isBuyForOther ? null:<View style={styles.inptoutsource}>
                        <Text style={styles.inptTitle}>出售内存（3081 Bytes）</Text>
                        <View style={styles.outsource}>
                            <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} 
                            returnKeyType="go" selectionColor="#65CAFF" style={styles.inpt} placeholderTextColor="#8696B0" 
                            placeholder="输入出售的数量" underlineColorAndroid="transparent" keyboardType="phone-pad"
                            onChangeText={(sellRamBytes) => this.setState({ sellRamBytes })}
                            />
                            <Button onPress={this.sellram.bind()}>
                                <View style={styles.botn}>
                                    <Text style={styles.botText}>出售</Text>
                                </View>
                            </Button> 
                        </View>
                    </View>}
                    <View style={styles.basc}>
                        <Text style={styles.basctext}>提示</Text>
                        <Text style={styles.basctext}>1.购买资源内存，你将获得更多权限的使用；</Text>
                        <Text style={styles.basctext}>2.购买和出售资源成功，主网将收取0.5%手续费用；</Text>
                        <Text style={styles.basctext}>3.购买后如过多闲置可进行出售；</Text>
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
  
      headbj: {
          justifyContent: "center", 
          alignItems: 'center',
          flexDirection:'column', 
          height: 140,
      },
  
      frameoutsource: {
          justifyContent: "center", 
          alignItems: 'center', 
          flexDirection:'row', 
          flex: 1, 
          paddingTop: 15,
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
      headoutsource: {
          justifyContent: "center", 
          alignItems: 'center', 
          flexDirection:'row', 
          paddingTop: 5,
      },
  
      headText: {
          color: '#7787A3', 
          fontSize: 12, 
          lineHeight: 60,
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

      inptoutsource: {
          padding: 20,  
          justifyContent: 'center',
      },
      outsource: {
          flexDirection: 'row',  
          alignItems: 'center',
      },
      inpt: {
          flex: 1, 
          color: '#8696B0', 
          fontSize: 15, 
          height: 40, 
          paddingLeft: 10, 
          backgroundColor: '#FFFFFF', 
          borderRadius: 5,
      },
      inptTitlered: {
          fontSize: 12, 
          color: '#FF6565', 
          lineHeight: 35,
      },
      inptTitle: {
          fontSize: 14, 
          color: '#7787A3', 
          lineHeight: 35,
      },
      botnimg: {
          marginLeft: 10, 
          width: 86, 
          height: 38, 
          justifyContent: 'center', 
          alignItems: 'flex-start'
      },
      botn: {
          marginLeft: 10, 
          width: 86, 
          height: 38,  
          borderRadius: 3, 
          backgroundColor: '#65CAFF', 
          justifyContent: 'center', 
          alignItems: 'center' 
      },
      botText: {
          fontSize: 17, 
          color: '#fff',
      },
      basc: {
          padding: 20,
      },
      basctext :{
          fontSize: 12, 
          color: '#8696B0', 
          lineHeight: 25,
      }
});

export default Memory;
