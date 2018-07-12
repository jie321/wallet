import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,ImageBackground,TouchableOpacity,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from 'react-native-vector-icons/Ionicons'
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import BaseComponent from "../../components/BaseComponent";
import ViewShot from "react-native-view-shot";
import { Eos } from "react-native-eosjs";
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
const _index = 0;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Bvote extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {    
          title: "资源管理",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },        
        };
      };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {
      total: '0.00',
      used: '0.00',
      used_Percentage: '0',
      currency_surplus: '0.00',

      ram_total: '0.00',
      ram_used:'0.00',
      ram_used_Percentage: '0',
      ram_available:'0.00',
      ram_available_Percentage: '0',

      cpu_staked: '0.00',
      cpu_Own_staked: '0.00',
      cpu_unstaking: '0.00',
      cpu_unstaking__Percentage: '0',
      cpu_unstaking_time: '00:00:00',
      cpu_total: '0.00',
      cpu_used: '0.00',
      cpu_available: '0.00',
      cpu_available_Percentage: '0',

      net_staked:'0.00',
      net_Own_staked: '0.00',
      net_unstaking: '0.00',
      net_unstaking_Percentage: '0',
      net_unstaking_time: '00:00:00',
      net_total: '0.00',
      net_used: '0.00',
      net_available: '0.00',
      net_available_Percentage: '0',

      isOwn: true,
      isOthers: false,
      isLease: true,
      isTransfer: false,

      index: 0,
      routes: [
        { key: '1', title: '内存资源' },
        { key: '2', title: '计算资源' },
        { key: '3', title: '网络资源' },
        { key: '4', title: '内存交易' },
      ],
      show: false,
      Currentprice: '0.00000',
      password: "",
      Mreceiver: "",
      buyRamAmount: "",
      sellRamBytes: "",
      Creceiver: "",
      Cdelegateb: "",
      Cundelegateb: "",
      Nreceiver: "",
      Ndelegateb: "",
      Nundelegateb: "",   
    };
  }

  componentDidMount() {
    EasyLoading.show();
    this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {
        this.getAccountInfo();
    }}); 
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
    DeviceEventEmitter.addListener('wallet_info', (data) => {
        this.getBalance();
        });

    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
        this.getBalance();
    });

    DeviceEventEmitter.addListener('eos_balance', (data) => {
        this.setEosBalance(data);
    });
    this.props.dispatch({type: 'vote/getGlobalInfo', payload: {}, callback: (data) => {
        this.setState({
            total:data.rows[0].max_ram_size?(data.rows[0].max_ram_size/1024/1024/1024).toFixed(2) : "00.00GB",
            used:data.rows[0].total_ram_bytes_reserved?(data.rows[0].total_ram_bytes_reserved/1024/1024/1024).toFixed(2) : "00.00GB",
            used_Percentage:(((data.rows[0].total_ram_bytes_reserved/1024/1024/1024).toFixed(2)/(data.rows[0].max_ram_size/1024/1024/1024).toFixed(2))*10000/100).toFixed()
        });
    }}); 
    this.props.dispatch({type: 'vote/getqueryRamPrice', payload: {}, callback: (data) => {
        this.setState({
            Currentprice:data.data?data.data:'0.00000',
        });
    }}); 
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getAccountInfo(){
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      this.setState({
            currency_surplus:data.core_liquid_balance.replace(" EOS", ""), // 剩余EOS
            //内存资源
            ram_total:data.total_resources.ram_bytes?(data.total_resources.ram_bytes / 1024).toFixed(2):'0.00',//内存资源总计kb
            ram_used:data.ram_usage?(data.ram_usage / 1024).toFixed(2):'0.00', //内存资源已用(占用)kb
            ram_used_Percentage:(data.ram_usage/data.total_resources.ram_bytes*10000/100).toFixed(), //占用百分比
            ram_available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(2),//内存资源可用kb
            ram_available_Percentage:((data.total_resources.ram_bytes - data.ram_usage)/data.total_resources.ram_bytes*10000/100).toFixed(),//可用百分比
            //计算资源
            cpu_staked:data.total_resources.cpu_weight?data.total_resources.cpu_weight.replace(" EOS", ""):'0.00', //计算资源总抵押(EOS)
            cpu_Own_staked:data.self_delegated_bandwidth?data.self_delegated_bandwidth.cpu_weight.replace("EOS", "") : "0.00",//计算资源赎自己抵押
            cpu_unstaking:data.refund_request?data.refund_request.cpu_amount.replace("EOS", "") : "0.00",//计算资源赎回中
            cpu_unstaking_Percentage:((data.self_delegated_bandwidth.cpu_weight.replace("EOS", "")/data.total_resources.cpu_weight.replace(" EOS", ""))*10000/100).toFixed(),//计算资源赎回时间百分比
            cpu_unstaking_time:data.refund_request.request_time?data.refund_request.request_time.replace("T", " "):'00:00:00',//计算资源赎回时间
            //计算赎回百分比
            cpu_total:((data.cpu_limit.used+data.cpu_limit.available)/1000).toFixed(2),//合计计算资源ms
            cpu_used:data.cpu_limit.used?(data.cpu_limit.used / 1000).toFixed(2):'0.00', //计算资源已用ms
            cpu_available:data.cpu_limit.available?(data.cpu_limit.available / 1000).toFixed(2):'0.00', //计算资源可用ms
            cpu_available_Percentage:(data.cpu_limit.available/(data.cpu_limit.used+data.cpu_limit.available)*10000/100).toFixed(),//可用百分比
            //网络资源
            net_staked:data.total_resources.net_weight?data.total_resources.net_weight.replace("EOS", "") : "0.00", //网络资源总抵押
            net_Own_staked:data.self_delegated_bandwidth?data.self_delegated_bandwidth.net_weight.replace("EOS", "") : "0.00", //网络资源自己抵押
            net_unstaking:data.refund_request?data.refund_request.net_amount.replace("EOS", "") : "0.00", //网络资源赎回中
            net_unstaking_Percentage:((data.self_delegated_bandwidth.net_weight.replace("EOS", "")/data.total_resources.net_weight.replace(" EOS", ""))*10000/100).toFixed(),//网络资源赎回时间百分比
            net_unstaking_time:data.refund_request.request_time?data.refund_request.request_time.replace("T", " "):'00:00:00',//网络资源赎回时间
            //网络赎回百分比
            net_total:((data.net_limit.used+data.net_limit.available)/1024).toFixed(2),//合计网络资源kb
            net_used:data.net_limit.used?(data.net_limit.used/1024).toFixed(3):'0.00', //网络资源已用kb
            net_available:data.net_limit.available?(data.net_limit.available / 1024).toFixed(3):'0.00', //网络资源可用kb
            net_available_Percentage:(data.net_limit.available/(data.net_limit.used+data.net_limit.available)*10000/100).toFixed(),//可用百分比
          });
          EasyLoading.dismis();
    } });
  } 

  getBalance() { 
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
            this.setEosBalance(data);
        }
      })
    } else {
      this.setState({ balance: '0'})
    }
  }
  
  setEosBalance(data){
    if (data.code == '0') {
        if (data.data == "") {
          this.setState({
            balance: '0',
          })
        } else {
          account: this.props.defaultWallet.name,
          this.setState({ balance: data.data.replace("EOS", ""), })
        }
      } else {
        // EasyToast.show('获取余额失败：' + data.msg);
      }
  }


  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Calculation'){
      navigate('Calculation', {});
    }else if (key == 'Memory') {
      navigate('Memory', {});
    }else if (key == 'Network') {
      navigate('Network', {});
    }else if (key == 'Resources') {
      navigate('Resources', {});
    }else {
      EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
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

    // 返回自己或他人租赁或过户
    _getButton(style, selectedSate, stateType, buttonTitle) {    
      let BTN_SELECTED_STATE_ARRAY = ['isOwn', 'isOthers','isLease','isTransfer'];  
      return(  
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center',alignItems: 'center', flex: 1,}} onPress={ () => {this._updateBtnSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={{fontSize: 16,color: UColor.fontColor}}>{buttonTitle}</Text>  
            <View style={{width: 12, height: 12, marginHorizontal: 8, borderRadius: 3, backgroundColor: UColor.fontColor, alignItems: 'center', justifyContent: 'center',}}>
                {selectedSate ?<View style={{width: 10, height: 10, borderRadius: 10, backgroundColor: UColor.tintColor }}/>:null}
            </View>
        </TouchableOpacity>  
      );  
    }  

  //获得typeid坐标
  getRouteIndex(typeId){
    for(let i=0;i<this.state.routes.length;i++){
        if(this.state.routes[i].key==typeId){
            return i;
        }
    }
  }

  //切换tab
  _handleIndexChange = index => {
    this.setState({index});
  };

 _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({index});
  }

   // 显示/隐藏 modal  
   _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
    show: !isShow,
    });
  }

  chkAccount(obj) {
    var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
    for(var i = 0 ; i < obj.length;i++){
        var tmp = obj.charAt(i);
        for(var j = 0;j < charmap.length; j++){
            if(tmp == charmap.charAt(j)){
                break;
            }
        }
        if(j >= charmap.length){
            //非法字符
            obj = obj.replace(tmp, ""); 
            EasyToast.show('请输入正确的账号');
        }
    }
    if (obj == this.props.defaultWallet.account) {
        EasyToast.show('接收账号和自己账号不能相同，请重输');
        obj = "";
    }
    return obj;
  }

  chkPrice(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    try {
      value = parseFloat(obj);
    } catch (error) {
      value = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    return obj;
  }
  // 购买内存
  buyram = (rowData) => { 
      if(!this.props.defaultWallet){
          EasyToast.show('请先创建钱包');
          return;
      }
      if(this.state.buyRamAmount == ""){
          EasyToast.show('请输入购买金额');
          return;
      }
      var tmp;
      try {
           tmp = parseFloat(this.state.buyRamAmount);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          this.setState({ buyRamAmount: "" })
          EasyToast.show('请输入购买金额');
          return ;
      }

      this. dismissKeyboardClick();
          const view =
          <View style={styles.passoutsource}>
              <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                  selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                  placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
              <Text style={styles.inptpasstext}></Text>  
          </View>
          EasyDialog.show("请输入密码", view, "确认", "取消", () => {
          if (this.state.password == "" || this.state.password.length < 8) {
              EasyToast.show('请输入密码');
              return;
          }
          var privateKey = this.props.defaultWallet.activePrivate;
          try {
              var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
              var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
              if (plaintext_privateKey.indexOf('eostoken') != -1) {
                  plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                  EasyLoading.show();
                  if(this.state.isOwn){
                      this.state.Mreceiver = this.props.defaultWallet.account;
                  }
                  Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.Mreceiver, this.state.buyRamAmount + " EOS", (r) => {
                      EasyLoading.dismis();
                      if(r.isSuccess){
                          this.getAccountInfo();
                          EasyToast.show("购买成功");
                      }else{
                          this._setModalVisible();
                      }
                  });
              } else {
                  EasyLoading.dismis();
                  EasyToast.show('1密码错误');
              }
          } catch (e) {
              EasyLoading.dismis();
              EasyToast.show('2密码错误');
          }
          EasyDialog.dismis();
      }, () => { EasyDialog.dismis() });
  };
   // 出售内存
    sellram = (rowData) => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if(this.state.sellRamBytes == ""){
            EasyToast.show('请输入出售内存kb数量');
            return;
        }
        var tmp;
      try {
           tmp = parseFloat(this.state.sellRamBytes);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          this.setState({ sellRamBytes: "" })
          EasyToast.show('请输入出售内存kb数量');
          return ;
      }

        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}></Text>  
            </View>
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < 8) {
                EasyToast.show('请输入密码');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    EasyLoading.show();
                    Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, this.state.sellRamBytes * 1024, (r) => {
                        EasyLoading.dismis();
                        if(r.isOwn){
                            this.getAccountInfo();
                            EasyToast.show("出售成功");
                        }else{
                            this._setModalVisible();
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

    // 计算抵押
    Cdelegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.Cdelegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        var tmp;
        try {
            tmp = parseFloat(this.state.Cdelegateb);
            } catch (error) {
                tmp = 0;
            }
        if(tmp <= 0){
            this.setState({ Cdelegateb: "" })
            EasyToast.show('请输入抵押的EOS数量');
            return ;
        }

        this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：抵押 {this.state.Cdelegateb} EOS</Text>
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < 8) {
                EasyToast.show('请输入密码');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    if(this.state.isOwn){
                        this.state.Creceiver = this.props.defaultWallet.account;
                    }
                    EasyLoading.show();
                    // 抵押
                    Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.Creceiver, this.state.Cdelegateb + " EOS", "0 EOS", (r) =>{
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("抵押成功");
                        }else{
                            this._setModalVisible();
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
    }
    //计算赎回
    Cundelegateb = () => { 
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.Cundelegateb == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }
        var tmp;
        try {
             tmp = parseFloat(this.state.Cundelegateb);
          } catch (error) {
              tmp = 0;
          }
        if(tmp <= 0){
            this.setState({ Cundelegateb: "" })
            EasyToast.show('请输入赎回的EOS数量');
            return ;
        }

        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go"  
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：赎回 {this.state.Cundelegateb} EOS</Text>
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < 8) {
                EasyToast.show('请输入密码');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    if(this.state.isOwn){
                        this.state.Creceiver = this.props.defaultWallet.account;
                    }
                    EasyLoading.show();
                    // 解除抵押
                    Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.Creceiver, this.state.Cundelegateb + " EOS", "0 EOS", (r) => {
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("赎回成功");
                        }else{    
                            this._setModalVisible();
                        }
                    })
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

    // 网络抵押
    Ndelegateb = () => {
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        if ((this.state.Ndelegateb == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }
        var tmp;
        try {
             tmp = parseFloat(this.state.Ndelegateb);
        } catch (error) {
            tmp = 0;
        }
        if(tmp <= 0){
            this.setState({ Ndelegateb: "" })
            EasyToast.show('请输入抵押的EOS数量');
            return ;
        }
        this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
               selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：抵押 {this.state.Ndelegateb} EOS</Text>
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < 8) {
            EasyToast.show('请输入密码');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                if(this.state.isOwn){
                    this.state.Nreceiver = this.props.defaultWallet.account;
                }
                EasyLoading.show();
                // 抵押
                Eos.delegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.Nreceiver,  "0 EOS", this.state.Ndelegateb + " EOS", (r) =>{
                    EasyLoading.dismis();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("抵押成功");
                    }else{
                        this._setModalVisible();
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
    }
    //网络赎回
    Nundelegateb = () => { 
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        
        if ((this.state.Nundelegateb == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }
        var tmp;
        try {
             tmp = parseFloat(this.state.Nundelegateb);
        } catch (error) {
            tmp = 0;
        }
        if(tmp <= 0){
            this.setState({ Nundelegateb: "" })
            EasyToast.show('请输入赎回的EOS数量');
            return ;
        }
        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                   selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={18}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：赎回 {this.state.Nundelegateb} EOS</Text>
            </View>   
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
            if (this.state.password == "" || this.state.password.length < 8) {
                EasyToast.show('请输入密码');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    if(this.state.isOwn){
                        this.state.Nreceiver = this.props.defaultWallet.account;
                    }
                    EasyLoading.show();
                    // 解除抵押
                    Eos.undelegate(plaintext_privateKey, this.props.defaultWallet.account, this.state.Nreceiver, "0 EOS", this.state.Nundelegateb + " EOS", (r) => {
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("赎回成功");
                        }else{
                            this._setModalVisible();
                        }
                    })

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

    transferTimeZone(date){
        //转换时间
        let timezone = moment(date).add(8,'hours').format('YYYY-MM-DD HH:mm:ss');
        let regEx = new RegExp("\\-","gi");
        let validDateStr=timezone.replace(regEx,"/");
        let milliseconds=Date.parse(validDateStr);
        let sendTime = new Date(milliseconds).getTime();
        //当前时间
        let nowTime = new Date().getTime();
        //72小时
        let ThreeTime = 259200000;
        //差值
        let Dvalue = nowTime - sendTime ;
        let SurplusTime = ThreeTime - Dvalue
        // 时 
        const hours = Math.floor(SurplusTime / (3600 * 1000)); 
        // 分 
        const leave2 = SurplusTime % (3600 * 1000); 
        const minutes = Math.floor(leave2 / (60 * 1000)); 
        // 秒 
        const leave3 = leave2 % (60 * 1000); 
        const seconds = Math.round(leave3 / 1000); 
        let Surplus = hours + ':' + minutes + ':' + seconds
        return Surplus;
    }

    cpuPercentageTime(date){
        //转换时间
        let timezone = moment(date).add(8,'hours').format('YYYY-MM-DD HH:mm:ss');
        let regEx = new RegExp("\\-","gi");
        let validDateStr=timezone.replace(regEx,"/");
        let milliseconds=Date.parse(validDateStr);
        let sendTime = new Date(milliseconds).getTime();
        //当前时间
        let nowTime = new Date().getTime();
        //72小时
        let ThreeTime = 259200000;
        //差值
        let Dvalue = nowTime - sendTime ;
        let SurplusTime = Dvalue/ThreeTime; 
        
        let Surplus = (SurplusTime*10000/100).toFixed() + '%'
        return Surplus;
    }
 
    dismissKeyboardClick() {
        dismissKeyboard();
    }

 //渲染页面
 renderScene = ({ route }) => {
  if (route.key == '1') {
    const v = <View style={styles.container}>
       <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
            <ScrollView keyboardShouldPersistTaps="always">
                <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}> 
                    <View style={styles.nhaaout}>
                        <View style={styles.wterout}>
                            <View style={styles.OwnOthers}>  
                                {this._getButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                {this._getButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                            </View> 
                        </View> 
                        {this.state.isOwn ? null:
                        <View style={styles.inptoutsource}>
                            <Text style={styles.inptTitle}>注：只限EOS账号，一旦送出可能无法收回！</Text>
                            <View style={styles.outsource}>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.Mreceiver}  returnKeyType="go" 
                                selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" maxLength = {12}
                                onChangeText={(Mreceiver) => this.setState({ Mreceiver: this.chkAccount(Mreceiver) })}
                                />
                                <Button >
                                    <View style={styles.botnimg}>
                                        <Image source={UImage.scan} style={{width: 26, height: 26, }} />
                                    </View>
                                </Button> 
                            </View>
                        </View>
                        }
                        <View style={styles.inptoutsource}>
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text style={styles.inptTitle}>购买内存（{this.state.currency_surplus}EOS）</Text>
                                <Text style={{fontSize:12, color: '#7787A3',}}>≈{(this.state.currency_surplus*this.state.Currentprice).toFixed(3)}kb</Text>
                            </View>
                            <View style={styles.outsource}>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                                selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                                />
                                <Button onPress={this.buyram.bind()}>
                                    <View style={styles.botn}>
                                        <Text style={styles.botText}>购买</Text>
                                    </View>
                                </Button> 
                            </View>
                        </View>
                        {this.state.isOthers ? null:<View style={styles.inptoutsource}>
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text style={styles.inptTitle}>出售内存（{this.state.ram_available}KB）</Text>
                                <Text style={{fontSize:12, color: '#7787A3',}}>≈{(this.state.ram_available/this.state.Currentprice).toFixed(3)}EOS</Text>
                            </View>
                            <View style={styles.outsource}>
                                <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} returnKeyType="go" 
                                selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow}
                                placeholder="输入出售的数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes)})}
                                />
                                <Button onPress={this.sellram.bind()}>
                                    <View style={styles.botn}>
                                        <Text style={styles.botText1}>出售</Text>
                                    </View>
                                </Button> 
                            </View>
                        </View>}
                    </View>
                    <View style={styles.basc}>
                        <Text style={styles.basctext}>提示</Text>
                        <Text style={styles.basctext}>当前内存价格：{this.state.Currentprice}/KB</Text>
                        <Text style={styles.basctext}>内存资源，可以使用EOS买入，也可以出售得EOS</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView> 
        </KeyboardAvoidingView>  
    </View>
     return (v);
  }
  if (route.key == '2') {
      const v = <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.nhaaout}>
                            <View style={styles.wterout}>
                                <View style={styles.OwnOthers}>  
                                    {this._getButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                    {this._getButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                </View> 
                                <View style={styles.LeaseTransfer}>  
                                    {this._getButton(styles.tabbutton, this.state.isLease, 'isLease', '租赁')}  
                                    {this._getButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', '过户')}  
                                </View> 
                            </View> 
                            {this.state.isOwn ? null:
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>设置接收者</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._account = ref} value={this.state.Creceiver} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                        placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" maxLength={12}
                                        onChangeText={(Creceiver) => this.setState({ Creceiver : this.chkAccount(Creceiver) })}
                                    />
                                    <Button >
                                        <View style={styles.botnimg}>
                                            <Image source={UImage.scan} style={{width: 26, height: 26, }} />
                                        </View>
                                    </Button> 
                                </View>
                            </View>}  
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>抵押（EOS）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.Cdelegateb} returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                    placeholder="输入抵押数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(Cdelegateb) => this.setState({ Cdelegateb: this.chkPrice(Cdelegateb)})}
                                    />
                                    <Button onPress={this.Cdelegateb.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>抵押</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>赎回（EOS）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.Cundelegateb} returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                    placeholder="输入赎回数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(Cundelegateb) => this.setState({ Cundelegateb: this.chkPrice(Cundelegateb)})}   
                                    />
                                    <Button onPress={this.Cundelegateb.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>赎回</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                        </View>
                        <View style={styles.basc}>
                            <Text style={styles.basctext}>提示</Text>
                            <Text style={styles.basctext}>获取资源需要抵押EOS </Text>
                            <Text style={styles.basctext}>抵押的EOS可撤销抵押，并于3天后退回</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView> 
            </KeyboardAvoidingView>  
       </View>
     return (v);
  }
  if (route.key == '3') {
      const v = <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.nhaaout}>
                            <View style={styles.wterout}>
                                <View style={styles.OwnOthers}>  
                                    {this._getButton(styles.tabbutton, this.state.isOwn, 'isOwn', '自己')}  
                                    {this._getButton(styles.tabbutton, this.state.isOthers, 'isOthers', '他人')}  
                                </View> 
                                <View style={styles.LeaseTransfer}>  
                                    {this._getButton(styles.tabbutton, this.state.isLease, 'isLease', '租赁')}  
                                    {this._getButton(styles.tabbutton, this.state.isTransfer, 'isTransfer', '过户')}  
                                </View> 
                            </View> 
                            {this.state.isOwn ? null:
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>设置接收者</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._account = ref} value={this.state.Nreceiver} returnKeyType="go"
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                                        placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" 
                                        onChangeText={(Nreceiver) => this.setState({ Nreceiver: this.chkAccount(Nreceiver)})}
                                    />
                                    <Button >
                                        <View style={styles.botnimg}>
                                            <Image source={UImage.scan} style={{width: 26, height: 26, }} />
                                        </View>
                                    </Button> 
                                </View>
                            </View>}  
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>抵押（EOS）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.Ndelegateb} returnKeyType="go"
                                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                    placeholder="输入抵押数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(Ndelegateb) => this.setState({ Ndelegateb: this.chkPrice(Ndelegateb)})}
                                    />
                                    <Button onPress={this.Ndelegateb.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>抵押</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>赎回（EOS）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.Nundelegateb} returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                    placeholder="输入赎回数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(Nundelegateb) => this.setState({ Nundelegateb: this.chkPrice(Nundelegateb)})}
                                    />
                                    <Button onPress={this.Nundelegateb.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>赎回</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                        </View>
                        <View style={styles.basc}>
                            <Text style={styles.basctext}>提示</Text>
                            <Text style={styles.basctext}>获取资源需要抵押EOS </Text>
                            <Text style={styles.basctext}>抵押的EOS可撤销抵押，并于3天后退回</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>  
            </KeyboardAvoidingView> 
       </View>
      return (v);
    }
    if (route.key == '4') {
      return (<View style={styles.container}>
            <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65, backgroundColor: UColor.mainColor, flexDirection: "row", alignItems: 'center', justifyContent: "center", paddingHorizontal: 20, borderRadius: 5, margin: 5,}}> 
              <Text  style={{fontSize: 16, color: UColor.fontColor}}>该功能正在紧急开发中，敬请期待!</Text>
            </View>
          </View>);
     }
  }
  
    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
        <View style={styles.container}>
            {/* <TouchableHighlight onPress={this.goPage.bind(this, 'Calculation')}>                         
                <Text style={styles.headtextSize}>计算资源</Text>   
            </TouchableHighlight>  
            <TouchableHighlight onPress={this.goPage.bind(this, 'Network')}> 
                <Text style={styles.headtextSize}>网络资源</Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.goPage.bind(this, 'Memory')}> 
                <Text style={styles.headtextSize}>内存资源</Text>
            </TouchableHighlight> */}
            <View style={styles.tetleout}>
              <Text style={styles.tetletext}>
                  {this.state.index == 0&&"内存概况"}
                  {this.state.index == 1&&"计算概况"}
                  {this.state.index == 2&&"网络概况"}
                  {this.state.index == 3&&"内存交易"}
              </Text>
              <ImageBackground source={UImage.line_bg} resizeMode="cover" style={styles.linebgout}>
                  <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                      {this.state.index == 0&&<View style={styles.stripbg} height={(100-this.state.ram_used_Percentage)+'%'}/>}
                      {this.state.index == 1&&<View style={styles.stripbg} height={(100-this.state.cpu_available_Percentage)+'%'}/>}
                      {this.state.index == 2&&<View style={styles.stripbg} height={(100-this.state.net_available_Percentage)+'%'}/>}
                  </ImageBackground>
                  <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                      {this.state.index == 0&&<View style={styles.stripbg} height={(100-this.state.ram_available_Percentage)+'%'}/>}
                      {this.state.index == 1&&<View style={styles.stripbg} height={(100-this.state.cpu_unstaking_Percentage)+'%'}/>}
                      {this.state.index == 2&&<View style={styles.stripbg} height={(100-this.state.net_unstaking_Percentage)+'%'}/>}
                  </ImageBackground>
                  <ImageBackground source={UImage.strip_bg} resizeMode="cover"  style={styles.stripbgout}>
                      {this.state.index == 0&&<View style={styles.stripbg} height={(100-this.state.used_Percentage)+'%'}/>}
                      {this.state.index == 1&&<View style={styles.stripbg} height={(this.cpuPercentageTime(this.state.cpu_unstaking_time))}/>}
                      {this.state.index == 2&&<View style={styles.stripbg} height={(this.cpuPercentageTime(this.state.net_unstaking_time))}/>}
                  </ImageBackground>
              </ImageBackground>
              <View style={styles.record}>
                  <View style={styles.recordout}>
                    <Text style={styles.ratiotext}>
                      {this.state.index == 0&&this.state.ram_used+'kb/'+this.state.ram_total+'kb'}
                      {this.state.index == 1&&this.state.cpu_available+'/'+this.state.cpu_total}
                      {this.state.index == 2&&this.state.net_available+'/'+this.state.net_total}
                    </Text>
                    <Text style={styles.recordtext}>
                      {this.state.index == 0&&'占用('+this.state.ram_used_Percentage+'%)'}
                      {this.state.index == 1&&'可用(ms)'}
                      {this.state.index == 2&&'可用(ms)'}
                    </Text>
                  </View>
                  <View style={styles.recordout}>
                    <Text  style={styles.ratiotext}>
                      {this.state.index == 0&&this.state.ram_available+'kb/'+this.state.ram_total+'kb'}
                      {this.state.index == 1&&this.state.cpu_Own_staked+'/'+this.state.cpu_staked}
                      {this.state.index == 2&&this.state.net_Own_staked+'/'+this.state.net_staked}
                    </Text>
                    <Text style={styles.recordtext}>
                      {this.state.index == 0&&'可用('+this.state.ram_available_Percentage+'%)'}
                      {this.state.index == 1&&'抵押(EOS)'}
                      {this.state.index == 2&&'抵押(EOS)'}
                    </Text>
                  </View>
                  <View style={styles.recordout}>
                    <Text  style={styles.ratiotext}>
                      {this.state.index == 0&&this.state.used+'GB/'+this.state.total+'GB'}
                      {this.state.index == 1&&this.transferTimeZone(this.state.cpu_unstaking_time)}
                      {this.state.index == 2&&this.transferTimeZone(this.state.net_unstaking_time)}
                    </Text>
                    <Text style={styles.recordtext}>
                      {this.state.index == 0&&'全网('+this.state.used_Percentage+'%)'}
                      {this.state.index == 1&&'赎回中('+this.state.cpu_unstaking+')'}
                      {this.state.index == 2&&'赎回中('+this.state.net_unstaking+')'}
                    </Text>
                  </View>
              </View>
            </View>
            <TabViewAnimated lazy={true} style={styles.animatedout} navigationState={this.state} renderScene={this.renderScene.bind(this)}
               renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} labelStyle={styles.labelout} tabStyle={styles.tabout} 
               indicatorStyle={styles.indicator} style={styles.tabbarout}  scrollEnabled={true} {...props} />}
               onIndexChange={this._handleIndexChange} initialLayout={{ height: 0, width: Dimensions.get('window').width }}
            />
             <View style={styles.pupuo}>
                <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={styles.modalStyle}>
                        <View style={styles.subView} >
                        <Button style={{ alignItems: 'flex-end', }} onPress={this._setModalVisible.bind(this)}>
                            <Text style={styles.closeText}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>资源受限</Text>
                        <View style={styles.contentText}>
                            <Text style={styles.textContent}>抱歉,该账号资源(NET/CPU)不足以支持本次操作,请设置小的额度尝试或联系身边的朋友帮您抵押。</Text>
                        </View>
                        <Button onPress={() => { this._setModalVisible() }}>
                            <View style={styles.buttonView}>
                            <Text style={styles.buttonText}>知道了</Text>
                            </View>
                        </Button>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
        )
    }
}
const styles = StyleSheet.create({
    // 密码输入框
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: ScreenWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    inptpasstext: {
        fontSize: 14,
        color: '#808080',
        lineHeight: 25,
        marginTop: 5,
    },

    inptoutsource1: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'center',
    },
    outsource1: {
        flexDirection: 'row',  
        alignItems: 'center',
    },
    inpt1: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: 15, 
        height: 40, 
        paddingLeft: 10, 
        backgroundColor: UColor.fontColor, 
        borderRadius: 5,
    },
    inptTitlered1: {
        fontSize: 12, 
        color: '#FF6565', 
        lineHeight: 35,
    },
    inptTitle1: {
        fontSize: 14, 
        color: '#7787A3', 
        lineHeight: 35,
    },
    botnimg1: {
        marginLeft: 10, 
        width: 86, 
        height: 38, 
        justifyContent: 'center', 
        alignItems: 'flex-start'
    },
    botn1: {
        marginLeft: 10, 
        width: 86, 
        height: 38,  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText1: {
        fontSize: 17, 
        color: UColor.fontColor,
    },
    basc1: {
        padding: 20,
    },
    basctext1 :{
        fontSize: 12, 
        color: UColor.arrow, 
        lineHeight: 25,
    },

    tabbutton: {  
        alignItems: 'center',   
        justifyContent: 'center', 
    },  
    tablayout: {   
        flexDirection: 'row',  
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

    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
    },
    nov: {
        alignItems: 'center', 
        flexDirection:'row', 
        marginHorizontal: 6,
        height: 80,  
        backgroundColor:  UColor.mainColor, 
        borderRadius: 5, 
        marginTop: 6,
    },
    imgsize: {
        width: 40, 
        height: 40, 
        marginHorizontal: 20,
    },
    novoutsource: {
        flex: 1, 
        justifyContent: "center", 
        alignItems: 'flex-start', 
        flexDirection:'column',
    },
    headtextSize: {
        fontSize:16, 
        color: UColor.fontColor,  
        paddingBottom: 8,
    },
    textoutsource: {
        flexDirection:'row', 
        alignItems: "center",
    },
    textSizeone: {
        fontSize: 12, 
        color: UColor.arrow,
    },
    textSizetwo: {
        marginLeft: 10,
        fontSize: 12, 
        color: UColor.arrow,
    },
    arrow: {
        width: 40, 
        lineHeight: 80, 
        color: UColor.fontColor, 
        textAlign: 'center'
    },

    nhaaout: {
          backgroundColor: '#4f617d',
      },
      wterout: {
          flexDirection: 'row',
          paddingVertical: 10,
      },
      OwnOthers: {
          flexDirection: 'row',
          paddingHorizontal: 18,
          width: (ScreenWidth - 20) / 2,
      },
      LeaseTransfer: {
          flexDirection: 'row',
          paddingHorizontal: 18,
          width: (ScreenWidth - 20) / 2,
      },

    inptoutsource: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        justifyContent: 'center',
    },
    outsource: {
        flexDirection: 'row',  
        alignItems: 'center',
        borderBottomColor: UColor.secdColor, 
        borderBottomWidth: 0.5,
    },
    inpt: {
        flex: 1, 
        color: UColor.arrow, 
        fontSize: 15, 
        height: 45, 
        paddingLeft: 10, 
    },

    inptTitle: {
        fontSize: 14, 
        color: UColor.fontColor, 
        lineHeight: 35,
    },
    botnimg: {
        width: 86, 
        height: 38, 
        paddingHorizontal: 10,
        justifyContent: 'center', 
        alignItems: 'flex-end'
    },
    botn: {
        marginLeft: 10, 
        width: 86, 
        height: 38,  
        borderRadius: 3, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    botText: {
        fontSize: 17, 
        color: UColor.fontColor,
    },
    basc: {
        padding: 20,
    },
    basctext :{
        fontSize: 12, 
        color: UColor.arrow, 
        lineHeight: 25,
    },

    tetleout: {
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#4f617d',
    },
    tetletext: {
        fontSize: 15,
        color: '#7787A3',
        paddingVertical: 5
    },

    linebgout: {
        height: (ScreenWidth - 30) * 0.307,
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        flexDirection: 'row',
        zIndex: 1
    },
    stripbgout: {
        width: ((ScreenWidth - 30) * 0.307 - 5) * 0.236,
        height: (ScreenWidth - 30) * 0.307 - 5,
        zIndex: 2
    },
    stripbg: {
        backgroundColor: '#43536d'
    },
    ratiotext: {
        fontSize: 12,
        color: UColor.fontColor
    },
    recordtext: {
        fontSize: 12,
        color: '#7787A3'
    },
    record: {
        flexDirection: 'row',
    },
    recordout: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: 'center',
    },

    animatedout: {
        width: ScreenWidth,
        backgroundColor: UColor.fontColor,
    },
    labelout: {
        fontSize: 12,
        color: UColor.fontColor,
    },
    tabout: {
        width: ScreenWidth / 4,
        padding: 0,
        margin: 0
    },
    indicator: {
        borderRadius: 10,
        backgroundColor: UColor.tintColor,
        width: (ScreenWidth - 40) / 4,
        height: 30,
        marginVertical: 8,
        marginHorizontal: 5,
    },
    tabbarout: {
        height: 46,
        paddingVertical: 8,
        backgroundColor: UColor.secdColor
    },

    //弹框
    pupuo: {
        backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        backgroundColor: UColor.mask,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    // modal上子View的样式  
    subView: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor:  UColor.fontColor,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: UColor.baseline,
    },
    closeText: {
        width: 30,
        height: 30,
        marginBottom: 0,
        color: '#CBCBCB',
        fontSize: 28,
    },
    // 标题  
    titleText: {
        color: '#000000',
        marginBottom: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
    },
    textContent: {
        color: '#999999',
        fontSize: 14,
        textAlign: 'left',
        lineHeight: 25,
    },
    // 按钮  
    buttonView: {
        margin: 10,
        height: 46,
        borderRadius: 6,
        backgroundColor:  UColor.showy,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        color:  UColor.fontColor,
    }
})
export default Bvote;