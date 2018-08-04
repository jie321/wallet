import React from 'react';
import { connect } from 'react-redux'
import {Modal,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import {DrawerNavigator} from 'react-navigation';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
var ScreenWidth = Dimensions.get('window').width;
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import { EasyDialog } from "../../components/Dialog"
import BaseComponent from "../../components/BaseComponent";
import ProgressBar from '../../components/ProgressBar';
import moment from 'moment';
import { Eos } from "react-native-eosjs";
import Constants from '../../utils/Constants';
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;

const trackOption = ['最近交易','持仓大户'];

@connect(({ram,sticker,wallet, assets}) => ({...ram, ...sticker, ...wallet, ...assets}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          header:null,  //隐藏顶部导航栏
         //铃铛small_bell/small_bell_h
        //   headerRight: (
        //     // <Button name="share" onPress={() => this._rightTopClick()} >
        //       <View style={{ padding: 15 }}>
        //       <Image source={UImage.small_bell} style={{ width: 22, height: 22 }}></Image>
        //       </View>
        //     // </Button>
        //   )
        };
      };

  constructor(props) {
    super(props);
    this.state = {
        
      selectedSegment:"时分",
      selectedTrackSegment: trackOption[0],
      isBuy: false,
      isSell: false,
      isTxRecord: true,
      isTrackRecord: false,
      balance: '0.0000',   
      slideCompletionValue: 0,
      buyRamAmount: "0",    //输入购买的额度
      eosToKB: '0.0000',
      kbToEos: '0.0000',
      sellRamBytes: "0",    //输入出售的字节数
      queryaccount:"",     //查询账户 
      myRamAvailable: '0', // 我的可用字节
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      logRefreshing: false,
      modal: false,
      tradename:"RAM",  //交易币种
      showMore:false,  
      showMoreTitle:"更多",
      isKLine:false,  //是否K线
   };
  }

  componentWillMount() {

    super.componentWillMount();

    // this.props.dispatch({type: 'ram/clearRamPriceLine',payload:{}});
  }

  componentDidMount(){

    // 获取内存市场相关信息
    EasyLoading.show();
    this.props.dispatch({type: 'ram/getRamInfo',payload: {}, callback: () => {
        EasyLoading.dismis();
    }});

    // 默认获取2小时K线图
    this.fetchLine(2,'2小时');
   
    // 获取钱包信息和余额
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getAccountInfo();
    }});
    
    this.getRamTradeLog();
    
    DeviceEventEmitter.addListener('getRamInfoTimer', (data) => {
        this.onRefreshing();
    });

  }

  onRefreshing() {
    this.getRamInfo();
    this.getAccountInfo();
    if(this.state.isTxRecord && (this.state.queryaccount == null || this.state.queryaccount == '')){
        this.getRamTradeLog();
    }else{
        this.getRamTradeLogByAccount(this.state.queryaccount);
    }
    if(this.state.selectedTrackSegment == trackOption[0]) {
        this.getRamBigTradeLog();
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

    _leftTopClick = () => {
        this.setState({ modal: !this.state.modal });
        this.props.dispatch({type:'sticker/list',payload:{type:1}});
        // this.props.dispatch({ type: 'assets/myAssetInfo', payload: { page: 1, isInit: true}, callback: (myAssets) => {}});
    }
//   _rightTopClick = () => {
 
//   };
    changeToRamTx(){
        this.setState({
            modal: false,
            tradename:"RAM",
          });
    }
    changeCoinType(rowData){
        this.setState({
            modal: false,
            tradename:rowData.name,
          });
    }

  getRamInfo(){
    this.props.dispatch({type: 'ram/getRamInfo',payload: {}});

    // 获取曲线
    // this.setSelectedOption(this.state.selectedSegment);
  }

  getRamTradeLog(){
    this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}});    
  }

  getRamTradeLogByAccount(accountName){
    if(accountName == null|| accountName == ''){
        return;
    }
    this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: accountName}});    
  }

  getRamBigTradeLog(){
    this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}});    
  }

  getAccountInfo(){
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        return;
      }
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      this.setState({ myRamAvailable:((data.total_resources.ram_bytes - data.ram_usage)).toFixed(0)});
          this.getInitialization(); 
    } });

    this.getBalance();

  } 

  getInitialization() {
    if(this.state.isBuy){
        this.goPage('isBuy');
      }else if(this.state.isSell){
        this.goPage('isSell');
      }else{
      }   
  }

  fetchLine(type,opt){
    // this.setState({selectedSegment:opt});
    InteractionManager.runAfterInteractions(() => {
        this.props.dispatch({type:'ram/getRamPriceLine',payload:{type}});
    });
  }
  
  fetchKLine(type,opt){
    EasyToast.show("暂未实现K线");
  }

  onClickTimer(opt){

      if(opt == "时分"){
        this.setState({isKLine:false, showMore: false,selectedSegment:opt});
        this.fetchLine(2,opt);
        return ;
    }
    
    this.setState({isKLine:true, showMore: false,selectedSegment:opt});
    if(opt == "5分"){
        this.fetchKLine(6,opt);
    }else if(opt == "15分"){
        this.fetchKLine(24,opt);
    }else if(opt == "30分"){
        this.fetchKLine(48,opt);
    }else if(opt == "1小时"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(48,opt);
    }else if(opt == "1天"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(48,opt);
    }else if(opt == "1周"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(48,opt);
    }else if(opt == "1月"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(48,opt);
    }else if(opt == "3月"){
        this.setState({showMoreTitle:opt});
        this.fetchKLine(48,opt);
    }
  }
  
  onClickMore(){
    this.setState({ showMore: !this.state.showMore });
  }
  fetchTrackLine(type,opt){
    this.setState({selectedTrackSegment:opt});
    if(type == 0){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});    
    }else{
        EasyToast.show('开发中，查询区块持仓大户前10名记录');   
    }
  }

  setSelectedTrackOption(opt){
    if(opt== trackOption[0]){
      this.fetchTrackLine(0,opt);
    }else {
      this.fetchTrackLine(1,opt);
    }
  }

  setEosBalance(balance){
    if (balance == null || balance == "") {
        this.setState({balance: '0.0000'});
      } else {
          this.setState({ balance: balance.replace("EOS", "") });
      }
  }

  getBalance() {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            this.setEosBalance(data.data);
          }
        }
      })
}

  goPage(current) {
    if (current == 'isBuy'){
        // EasyToast.show('买');
    }else if (current == 'isSell'){
        // EasyToast.show('卖');
    }else if (current == 'isTxRecord'){
        //  EasyToast.show('待实现,查询区块最近的20笔交易记录');
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});    
        //当点击交易记录按钮清空输入框
        this.setState({queryaccount:'' });
    }
    else if (current == 'isTrackRecord'){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});   
    } 
    // EasyLoading.dismis(); 
 }
   // 更新"买，卖，交易记录，大单追踪"按钮的状态  
   _updateBtnState(currentPressed, array) { 
    if (currentPressed === 'undefined' || currentPressed === null || array === 'undefined' || array === null ) {  
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
    this.goPage(currentPressed);
  }  

  funcButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell','isTxRecord', 'isTrackRecord'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:UColor.tintColor} : {backgroundColor: UColor.secdColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: UColor.tintColor}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 
  transformColor(currentPressed) {
      if(currentPressed == 'isBuy'){
        return '#42B324';
      }else if(currentPressed == 'isSell'){
        return UColor.showy;
      }else{
        return UColor.tintColor;
      }
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
      return obj;
  }

  chkBuyEosQuantity(obj) {
      obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
      obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
      obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
      obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
      var max = 9999999999.9999;  // 100亿 -1
      var min = 0.0000;
      var value = 0.0000;
      var floatbalance;
      try {
        value = parseFloat(obj);
        floatbalance = parseFloat(this.state.balance);
      } catch (error) {
        value = 0.0000;
        floatbalance = 0.0000;
      }
      if(value < min|| value > max){
        EasyToast.show("输入错误");
        obj = "";
      }
      if (value > floatbalance) {
        EasyToast.show('账户余额不足,请重输');
        obj = "";
    }
      return obj;
  }
  chkInputSellRamBytes(obj) {
    obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"以外的字符
    obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
    obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
    obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
    var max = 9999999999.9999;  // 100亿 -1
    var min = 0.0000;
    var value = 0.0000;
    var ram_bytes = 0;
    try {
      value = parseFloat(obj);
      ram_bytes = parseFloat(this.state.myRamAvailable);
    } catch (error) {
      value = 0.0000;
      ram_bytes = 0.0000;
    }
    if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
    }
    if (value * 1024 > ram_bytes) {
      EasyToast.show('可卖KB不足,请重输');
      obj = "";
  }
    return obj;
}

  
  chkAmountIsZero(amount,errInfo)
  {
      var tmp;
      try {
           tmp = parseFloat(amount);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          EasyToast.show(errInfo);
          return true;
      }
      return false;
  }
  
  // 根据账号查找交易记录
  getRamLogByAccout = (queryaccount) =>{
    this.setState({queryaccount:queryaccount});
    if(queryaccount == null|| queryaccount == ''){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});  
        return;
    }
    EasyLoading.show();
    this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: queryaccount}, callback: (resp) => {
        EasyLoading.dismis();
        if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
            EasyToast.show("未找到交易哟~");
        }
    }});    
  }

  // 购买内存
  buyram = (rowData) => { 
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }

    if(this.state.buyRamAmount == ""){
        EasyToast.show('请输入购买金额');
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyLoading.show();
                Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.props.defaultWallet.account, this.state.buyRamAmount + " EOS", (r) => {
                    EasyLoading.dismis();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
                        }
                    }
                });
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyLoading.dismis();
            EasyToast.show('未知异常');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
};
  // 出售内存
  sellram = (rowData) => {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
        EasyToast.show('请先创建并激活钱包');
        return;
    }
    if(this.state.sellRamBytes == ""){
        EasyToast.show('请输入出售内存KB数量');
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存KB数量')){
        this.setState({ sellRamBytes: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
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
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("出售失败");
                            }
                        }else{
                            EasyToast.show("出售失败");
                        }
                    }
                });
                
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyLoading.dismis();
            EasyToast.show('未知异常');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  };

    dismissKeyboardClick() {
      dismissKeyboard();
  }

  getTextPromp(){
    var info = "大单>2000 中单500-200 小单<500";
    return info;
  }

  //输入卖掉的字节数占总字节的比例
  getSellRamRadio()
  {
     var ratio = 0;             //进度条比例值
     try {
         if(this.state.sellRamBytes)
         {
             if(this.state.myRamAvailable){
                //可用字节数存在且大于0
                var tmpsellRamBytes = 0;
                var tmpram_available = 0; 
                try {
                    tmpsellRamBytes = parseFloat(this.state.sellRamBytes);
                    tmpram_available = parseFloat(this.state.myRamAvailable);
                  } catch (error) {
                    tmpsellRamBytes = 0;
                    tmpram_available = 0;
                  }
                if(tmpsellRamBytes > tmpram_available)  
                {
                    //余额不足
                    this.setState({sellRamBytes:""});   
                    EasyToast.show("您的余额不足,请重输");        
                }else if(tmpram_available > 0){
                    ratio = tmpsellRamBytes / tmpram_available;
                } 
             }
         }
     } catch (error) {
        ratio = 0;
     }
     return ratio;
  }

  eosToKB(eos, currentPrice) {
    if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
        return '0';
    }
    return (eos/currentPrice).toFixed(4); 
  }

  kbToEos(kb, currentPrice){
    if(kb == null || kb == '' || currentPrice == null || currentPrice == ''){
        return '0.0000';
    }
    return (kb * currentPrice).toFixed(4);
  }

  openQuery(payer) {
    this.setState({
        isBuy: false, 
        isSell: false,
        isTxRecord: true,
        isTrackRecord:false, 
        queryaccount:payer
    });
    this.getRamLogByAccout(payer);
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }
  
  transferTimeZone(time){
    var timezone;
    try {
        timezone = moment(time).add(8,'hours').format('YYYY-MM-DD HH:mm');
    } catch (error) {
        timezone = time;
    }
    return timezone;
  }

  fileterSlideEos(coinList){
    if(coinList == null || coinList == []){
        return [];
    }
   for(var i = 0; i < coinList.length; i++){
       if(coinList[i].name && coinList[i].name == "EOS"){
            coinList.splice(i,1);
            break;
       }
   }
   return coinList;
  }

  render() {
    return <View style={styles.container}>
    <View style={styles.header}>  
        <TouchableOpacity onPress={this._leftTopClick.bind()}>
            <View style={styles.leftout} >
                <Image source={this.state.modal ? UImage.tx_slide0 : UImage.tx_slide1} style={styles.HeadImg}/>
            </View>
        </TouchableOpacity>
          <View style={styles.HeadTitle} >
              <Text style={{ fontSize: 18,color: UColor.fontColor, justifyContent: 'center',alignItems: 'center',}} 
                       numberOfLines={1} ellipsizeMode='middle'>{this.state.tradename + "/EOS"}</Text>
          </View>     
          {/* <TouchableOpacity onPress={this._rightTopClick.bind()}>
            <View style={styles.Rightout} >
              <Image source={this.state.isEye ? UImage.reveal_wallet : UImage.reveal_h_wallet} style={styles.HeadImg}/>
            </View>
          </TouchableOpacity> */}
      </View> 

    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
      <ScrollView keyboardShouldPersistTaps="always"
            refreshControl={
            <RefreshControl
                refreshing={this.state.logRefreshing}
                onRefresh={() => this.onRefreshing()}
                tintColor="#fff"
                colors={['#ddd', UColor.tintColor]}
                progressBackgroundColor="#ffffff"
            />
            }
        >
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
          <View style={{flex:1,flexDirection:'row',alignItems:'center' }}>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <View style={{flex:1,flexDirection:'row',alignItems:'center' }}>
                <Text style={{color:'#8696B0',fontSize:11,textAlign:'left', marginLeft:10}}>开盘   </Text>
                <Text style={{color:'#fff',fontSize:11,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.open.toFixed(4) : '0'} EOS/KB</Text>
              </View>
              {
              this.state.tradename == "RAM" ? <View style={{flexDirection:"row",flexGrow:1}}>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>内存占比</Text>
                <Text style={{color:'#fff',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.usage_ram : 0} GB/{this.props.ramInfo ? this.props.ramInfo.total_ram : 0} GB</Text>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center'}}> ({((this.props.ramInfo ? this.props.ramInfo.usage_ram_percent : '0') * 100).toFixed(2)}%)</Text>
              </View> : <View></View>
              }
              <View style={{flexDirection:"row",flexGrow:1}}>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>总资金</Text>
                <Text style={{color:'#fff',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.total_eos : '0'} EOS</Text>
              </View>
            </View>
            <View style={{flexDirection:'column',flexGrow:1,alignItems:"flex-end",marginRight:10}}>
                <View style={{flex:1,flexDirection:'row', alignItems:'center' }}>
                    <Text style={{color:'#fff',fontSize:20,textAlign:'center'}}> {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'}</Text>
                    <Text style={{color:'#8696B0',fontSize:13,marginTop:2,textAlign:'center', marginLeft:5,marginRight:2}}>价格</Text>
                </View>
                <View style={{flex:1,flexDirection:'row', alignItems:'center' }}>
                    <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.incdo:styles.incup}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                    <Text style={{color:'#8696B0',fontSize:13,marginTop:2,textAlign:'center', marginLeft:5}}>涨幅 </Text>
                </View>
            </View>
          </View>
          <View style={{flex:1,flexDirection:'row',justifyContent: 'center',alignItems:'center',marginLeft: 0,marginRight: 0,backgroundColor: '#4D607E',}}>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimer.bind(this,"时分")}>
                    <View style={{ marginLeft: 2,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "时分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>时分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>时分</Text>}
                    </View>
                </Button>   
            </View>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimer.bind(this,"5分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "5分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>5分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>5分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimer.bind(this,"15分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {this.state.selectedSegment == "15分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>15分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>15分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimer.bind(this,"30分")}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                       {this.state.selectedSegment == "30分" ? 
                                <Text style={{fontSize: 15, color: UColor.tintColor,}}>30分</Text> : 
                                        <Text style={{fontSize: 15, color: UColor.fontColor,}}>30分</Text>}
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickMore.bind(this)}>
                    <View style={{ flexDirection:"row",marginLeft: 0,width: 50, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        {(this.state.selectedSegment == "更多" || this.state.selectedSegment == "1小时" || this.state.selectedSegment == "1天"
                           || this.state.selectedSegment == "1周" || this.state.selectedSegment == "1月" || this.state.selectedSegment == "3月") ? 
                         <Text style={{fontSize: 15,color: UColor.tintColor,}}>{this.state.showMoreTitle}</Text> : 
                          <Text style={{fontSize: 15,color: UColor.fontColor,}}>{this.state.showMoreTitle}</Text>}
                         <Image source={ UImage.txbtn_more } style={ {flex:0,width: 10, height:5,resizeMode:'contain'}}/>
                    </View>
                </Button> 

            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button disabled={true}>
                    <View style={{ marginLeft: 0,width: 40, height: 25,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>    </Text>
                    </View>
                </Button> 
            </View>
         </View> 
         {this.state.showMore ?       
            <View style={{flex:1,flexDirection:'row',justifyContent: 'center',alignItems:'center',marginLeft: 0,marginRight: 0,backgroundColor: '#4D607E',}}>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button disabled={true}>
                    <View style={{ marginLeft: 2,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>    </Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1,}}>
                <Button onPress={this.onClickTimer.bind(this,"1小时")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1小时</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimer.bind(this,"1天")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1天</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
                <Button onPress={this.onClickTimer.bind(this,"1周")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1周</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
               <Button onPress={this.onClickTimer.bind(this,"1月")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>1月</Text>
                    </View>
                </Button> 
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
               <Button onPress={this.onClickTimer.bind(this,"3月")}>
                    <View style={{ marginLeft: 0,width: 40, height: 35,borderRadius: 3, justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>3月</Text>
                    </View>
                </Button> 
            </View>
         </View> 
           
        : <View></View>}  
        
        {
            this.state.isKLine ? 
            <View style={{flex:1,paddingTop:5}}>
            {
                <Echarts option={this.props.ramLineDatas?this.props.ramLineDatas:{}} width={ScreenWidth} height={160} />
            }
            </View>
            : <View style={{flex:1,paddingTop:5}}>
            {
                <Echarts option={this.props.ramLineDatas?this.props.ramLineDatas:{}} width={ScreenWidth} height={160} />
            }
            </View>
        }
        <View style={styles.tablayout}>  
            {this.funcButton(styles.buytab, this.state.isBuy, 'isBuy', '买')}  
            {this.funcButton(styles.selltab, this.state.isSell, 'isSell', '卖')}  
            {this.funcButton(styles.txRecordtab, this.state.isTxRecord, 'isTxRecord', '交易记录')}  
            {this.funcButton(styles.trackRecordtab, this.state.isTrackRecord, 'isTrackRecord', '大单追踪')}  
        </View> 
         {this.state.isBuy?<View>
                <View style={{flex:1,flexDirection:'row',alignItems:'center', paddingHorizontal: 20, }}>
                    <Text style={styles.greenText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                    <Text style={styles.inptTitle}>余额: {this.state.balance==""? "0.0000" :this.state.balance} EOS</Text>
                </View>
              <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                  <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount + ''} returnKeyType="go" 
                  selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                  placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                  onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkBuyEosQuantity(buyRamAmount), eosToKB: this.eosToKB(buyRamAmount, this.props.ramInfo?this.props.ramInfo.price:'')})}
                  />
                <Text style={{ fontSize: 15, color:UColor.fontColor, }}>EOS</Text>
              </View>
              <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                  <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, paddingLeft: 10, }}>≈{this.state.eosToKB}</Text>
                  <Text style={{ fontSize: 15, color:UColor.fontColor, }}>KB</Text>
              </View>
              <View style={styles.inptoutsource}>
                <View style={styles.outsource}>
                    <View style={{flex: 1, paddingRight: 20,}}>
                        <Slider 
                        maximumValue={this.state.balance*1}
                        minimumValue={0}
                        step={0.0001}
                        value={this.state.buyRamAmount*1}
                        onSlidingComplete={(value)=>this.setState({ buyRamAmount: value, eosToKB: this.eosToKB(value, this.props.ramInfo?this.props.ramInfo.price:'')})}
                        maximumTrackTintColor={UColor.tintColor}
                        minimumTrackTintColor={UColor.tintColor}
                        //android
                        thumbTintColor={UColor.tintColor}
                        //ios
                        // trackImage={UImage.progressbar_a}
                        // minimumTrackImage={UImage.progressbar_a}
                        // maximumTrackImage={UImage.progressbar_b}
                        />
                        <View style={{height: 30, flexDirection: 'row', paddingHorizontal: Platform.OS == 'ios' ? 0:15, justifyContent:'space-between',alignItems: 'center', }}>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>0</Text>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>1/3</Text>     
                            <Text style={{fontSize: 12, color:UColor.arrow }}>2/3</Text>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>ALL</Text>                                
                        </View>    
                    </View>
                    <Button onPress={this.buyram.bind(this)}>
                        <View style={styles.botn} backgroundColor={'#42B324'}>
                            <Text style={styles.botText}>买入</Text>
                        </View>
                    </Button> 
                </View>
              </View>
          </View>:  
               <View>{this.state.isSell?
                  <View>
                    <View style={{flex:1,flexDirection:'row',alignItems:'center',paddingHorizontal: 20, }}>
                        <Text style={styles.redText}>单价: {this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'} EOS/KB</Text>
                        <Text style={styles.inptTitle}>可卖: {(this.state.myRamAvailable == null || this.state.myRamAvailable == '') ? '0' : (this.state.myRamAvailable/1024).toFixed(4)} KB</Text>
                    </View>
                  <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes + ''} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkInputSellRamBytes(sellRamBytes), kbToEos: this.kbToEos(sellRamBytes, this.props.ramInfo?this.props.ramInfo.price:'')})}
                      />
                      <Text style={{ fontSize: 15, color:UColor.fontColor, }}>KB</Text>
                  </View>
                  <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, paddingLeft: 10,}}>≈{(this.state.kbToEos == null || this.state.kbToEos == '') ? '0' : this.state.kbToEos}</Text>
                      <Text style={{ fontSize: 15, color:UColor.fontColor, }}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={{flex: 1, paddingRight: 20,}}>
                                <Slider 
                                    maximumValue={this.state.myRamAvailable*1}
                                    minimumValue={0}
                                    step={1}
                                    value={this.state.sellRamBytes*1}
                                    onSlidingComplete={(value)=>this.setState({ sellRamBytes: value, kbToEos: this.kbToEos(value, this.props.ramInfo?this.props.ramInfo.price:'')})}
                                    maximumTrackTintColor={UColor.tintColor}
                                    minimumTrackTintColor={UColor.tintColor}
                                    //android
                                    thumbTintColor={UColor.tintColor}
                                    //ios
                                    // trackImage={UImage.progressbar_a}
                                    // minimumTrackImage={UImage.progressbar_a}
                                    // maximumTrackImage={UImage.progressbar_b}
                                    />
                                <View style={{height: 30, flexDirection: 'row', paddingHorizontal: Platform.OS == 'ios' ? 0:15, justifyContent:'space-between',alignItems: 'center', }}>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>0</Text>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>1/3</Text>     
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>2/3</Text>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>ALL</Text>                                
                                </View> 
                            </View>
                            <Button onPress={this.sellram.bind(this)}>
                                <View style={styles.botn} backgroundColor={UColor.showy}>
                                    <Text style={styles.botText}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                </View>
            </View>:
                <View>{this.state.isTxRecord ? <View >
                   <View style={{flexDirection: 'row', alignItems: 'center',borderBottomColor: UColor.secdColor, marginVertical: 10, marginHorizontal: 5, }}>
                    <View style={{flex: 1, height: 30, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <TextInput ref={(ref) => this._account = ref} value={this.state.queryaccount} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                            placeholder="请输入账户名称" underlineColorAndroid="transparent" keyboardType="default" 
                            onChangeText={(queryaccount) => this.setState({ queryaccount: this.chkAccount(queryaccount)})}
                        />
                    </View>     
                    <TouchableOpacity onPress={this.getRamLogByAccout.bind(this,this.state.queryaccount)}>  
                        <View style={{justifyContent: "center", alignItems: 'center', paddingHorizontal: 10, marginLeft: 5,}} >
                            <Image source={UImage.Magnifier} style={{ width: 25,height: 25}}></Image>
                        </View>
                    </TouchableOpacity> 
                    <TouchableOpacity onPress={this.getRamLogByAccout.bind(this,this.props.defaultWallet ? this.props.defaultWallet.account : '')}>  
                        <View style={{justifyContent: "center", alignItems: 'center', paddingHorizontal: 10, marginRight: 5,}} >
                            <Image source={UImage.Magnifier_me} style={{ width: 25,height: 25}}></Image>
                        </View>
                    </TouchableOpacity> 
                 </View>
                 <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.ramTradeLog == null ? [] : this.props.ramTradeLog)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                        <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65, backgroundColor: UColor.mainColor, flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between", borderRadius: 5,margin: 5,}}>
                            <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                    <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                    <Text style={{fontSize: 15,color: UColor.arrow,}}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                </View>
                                <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                    {rowData.action_name == 'sellram' ? 
                                    <Text style={{fontSize: 14,color: '#F25C49',textAlign: 'center'}}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
                                    :
                                    <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                    }
                                    <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{(rowData.price == null || rowData.price == '0') ? '' : rowData.price}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
                                </View>
                            </View>
                            {/* <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                            </View> */}
                        </View>
                    </Button>         
                     )}                
                 /> 
            </View>: 
            <View>
                <View style={{padding:10,paddingTop:5}}>
                    <SegmentedControls 
                    tint= {'#586888'}
                    selectedTint= {'#ffffff'}
                    onSelection={this.setSelectedTrackOption.bind(this) }
                    selectedOption={ this.state.selectedTrackSegment }
                    backTint= {'#43536D'} options={trackOption} />
                </View>
                {this.state.selectedTrackSegment == trackOption[0] ? 
                  <View>
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                      dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                        <Button onPress={this.openQuery.bind(this,rowData.payer)}>
                            <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65, backgroundColor: UColor.mainColor, flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between", borderRadius: 5,margin: 5,}}>
                              <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                  <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                      <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                      <Text style={{fontSize: 15,color: UColor.arrow,}}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                  </View>
                                  <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                      {rowData.action_name == 'sellram' ? 
                                      <Text style={{fontSize: 14,color: '#F25C49',textAlign: 'center'}}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
                                      :
                                      <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                      }
                                      <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{(rowData.price == null || rowData.price == '0') ? '' : rowData.price}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
                                  </View>
                              </View>
                              {/* <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                  <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                              </View> */}
                            </View>   
                        </Button>      
                      )}                
                  /> 
                  </View> :
                  <View>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                        dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                        <View>
                            <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65, backgroundColor: UColor.mainColor, flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between", borderRadius: 5,margin: 5,}}>
                                <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                    <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                        <Text style={{fontSize: 15,color: UColor.arrow,}}>{moment(rowData.record_date).add(8,'hours').fromNow()}</Text>
                                    </View>
                                    <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                        {rowData.action_name == 'sellram' ? 
                                        <Text style={{fontSize: 14,color: UColor.tintColor,textAlign: 'center'}}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
                                        :
                                        <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                        }
                                        <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{(rowData.price == null || rowData.price == '0') ? '' : rowData.price}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
                                    </View>
                                </View>
                                {/* <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                    <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                                </View> */}
                            </View>
                        </View>          
                        )}                
                    /> 
                  </View>
                }
                  {/* <Text style={{fontSize: 14,color: UColor.fontColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "center"}}>成交资金分布</Text>
                  <Text style={{fontSize: 12,color: UColor.tintColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "left"}}>{this.getTextPromp()}</Text> */}
                  {/* <View style={{flex:1,paddingTop:1}}>
                    {
                      <Echarts option={
                   {
                            title : {
                                text: '成交资金分布',
                                textStyle: {
                                    align: 'center',
                                    color: UColor.fontColor,
                                    fontSize: 14,
                                },
                                subtext: "大单>2000 中单500-200 小单<500",
                                subtextStyle:{
                                    align: 'left',
                                }
                            },
                            // tooltip : {
                            //     trigger: 'item',
                            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                            // },
                            legend: {
                                orient: 'vertical',
                                left: 'right',
                                top: 'middle',
                                data: ['超大','大单','大中','中单','中小','小单']
                            },
                            series : [
                                {
                                    name: '',   //访问来源
                                    type: 'pie',
                                    radius : ['40%', '70%'],
                                    center: ['35%', '60%'],
                                    hoverAnimation: false,
                                    animation:false,
                                    roam:false,
                                    silent:true,
                                    label:{
                                        show: true,
                                        position: 'inner',
                                    },
                                    data:[
                                        {value:335, name:'超大'},
                                        {value:310, name:'大单'},
                                        {value:234, name:'大中'},
                                        {value:135, name:'中单'},
                                        {value:1548, name:'中小'},
                                        {value:1548, name:'小单'}
                                    ],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        }
                        
                        } width={ScreenWidth - 10} height={200} />
                    }
                  </View> */}
                 </View>}
               </View>}
            </View>
          }   
        </TouchableOpacity>
      </ScrollView>  
    </KeyboardAvoidingView> 

    <Modal style={styles.touchableouts} animationType={'none'} transparent={true} onRequestClose={() => {this.setState({modal: false}); }} visible={this.state.modal}>
          <TouchableOpacity onPress={() => this.setState({ modal: false })} style={styles.touchable} activeOpacity={1.0}>
            <TouchableOpacity style={styles.touchable} activeOpacity={1.0}>

              <View style={styles.touchableout}>
               {/* <TouchableOpacity onPress={this._leftTopClick.bind()}> 
                <View style={{ paddingRight: 0,alignItems: 'flex-end', }} >
                    <Image source={UImage.tx_slide0} style={styles.HeadImg}/>
                </View>
                </TouchableOpacity> */}
               <View style={styles.ebhbtnout}>
                    <View style={{width:'37%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:20,fontSize:15,color:UColor.fontColor}}>内存</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start", }}>
                            <Text style={{fontSize:15,marginLeft:0,color:UColor.fontColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'35%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:15, color:UColor.fontColor, 
                                textAlign:'center', marginRight:5}}>单价(EOS)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.ebhbtnout2}>
                  <Button onPress={this.changeToRamTx.bind(this)}>
                      <View style={styles.sliderow}>
                        <View style={{width:'34%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>RAM</Text>
                            </View>
                        </View>
                        <View style={{width:'31%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start"}}>
                            <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.greenincup:styles.redincdo}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                            </View>
                        </View>
                        <View style={{width:'35%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:15, color:UColor.fontColor, 
                                    textAlign:'center', marginRight:5}}>{this.props.ramInfo ? this.props.ramInfo.price.toFixed(4) : '0.0000'}</Text>
                            </View>
                        </View>
                      </View>
                  </Button>
                </View>
                <View style={styles.ebhbtnout}>
                    <View style={{width:'37%'}}>
                        <View style={{ flex:1,flexDirection:"row",alignItems: 'center', }}>
                            <Text style={{marginLeft:20,fontSize:15,color:UColor.fontColor}}>币种</Text>
                        </View>
                    </View>
                    <View style={{width:'28%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start", }}>
                            <Text style={{fontSize:15,marginLeft:0,color:UColor.fontColor}}>涨幅</Text>
                        </View>
                    </View>
                    <View style={{width:'35%'}}>
                        <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end", }}>
                            <Text style={{ fontSize:15, color:UColor.fontColor,textAlign:'center', marginRight:5}}>单价(￥)</Text>
                        </View>
                    </View>
                </View>

                <ListView initialListSize={5} 
                  renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor ,}} />}
                  enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.coinList[1]==null?[]:this.fileterSlideEos(this.props.coinList[1]))}
                  renderRow={(rowData) => (
                    <Button onPress={this.changeCoinType.bind(this, rowData)}>
                      <View style={styles.sliderow}>
                        <View style={{width:'35%'}}>
                            <View style={{ flex:1,flexDirection:"row",alignItems: 'center'}}>
                                <Text style={{marginLeft:10,fontSize:15,color:UColor.fontColor}}>{rowData.name == null ? "" : rowData.name}</Text>
                            </View>
                        </View>
                        <View style={{width:'30%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-start"}}>
                                <Text style={rowData.increase>0?styles.greenincup:styles.redincdo}>{rowData.increase>0?'+'+rowData.increase:rowData.increase}%</Text>
                            </View>
                        </View>
                        <View style={{width:'35%'}}>
                            <View style={{flex:1,flexDirection:"row",alignItems: 'center',justifyContent:"flex-end"}}>
                                <Text style={{ fontSize:15, color:UColor.fontColor, 
                                    textAlign:'center', marginRight:5}}>{(rowData.price == null || rowData.price == "") ? "" : rowData.price.toFixed(2)}</Text>
                            </View>
                        </View>
                      </View>
                    </Button> 
                  )}
                />
           </View>
          </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop:Platform.OS == 'ios' ? 30 : 20,
    paddingBottom: 5,
    backgroundColor: UColor.mainColor,
  },
  leftout: {
    paddingLeft: 15
  },
  Rightout: {
    paddingRight: 0
  },
  HeadImg: {
    width: 25,
    height:15,
    marginHorizontal:1,
  },
  HeadTitle: {
    flex: 1,
    paddingLeft: 60,
    paddingHorizontal: 20,
    justifyContent: 'center', 
  },


  scrollView: {
   
  },
  row:{
    flex:1,
    backgroundColor:UColor.mainColor,
    flexDirection:"row",
    padding: 20,
    borderBottomColor: UColor.secdColor,
    borderBottomWidth: 0.6,
  
  },
  left:{
    width:'25%',
    flex:1,
    flexDirection:"column"
  },
  right:{
    width:'85%',
    flex:1,
    flexDirection:"column"
  },
  incup:{
    fontSize:20,
    color:'#F25C49',
    textAlign:'center',
    marginTop:2,
  },
  incdo:{
    fontSize:20,
    color:'#25B36B',
    textAlign:'center',
    marginTop:2,
  },
   tablayout: {   
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',  
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: UColor.secdColor,
    },
    buytab: {
        flex: 1,
        height: 33,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    selltab: {
        flex: 1,
        height: 33,
        borderTopColor: UColor.tintColor,
        borderRightColor: UColor.tintColor,
        borderBottomColor: UColor.tintColor,
        borderTopWidth: 1,
        borderRightWidth: 0.5,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    txRecordtab: {
        flex: 1,
        height: 33,
        borderTopColor: UColor.tintColor,
        borderLeftColor: UColor.tintColor,
        borderBottomColor: UColor.tintColor,
        borderTopWidth: 1,
        borderLeftWidth: 0.5,
        borderBottomWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    trackRecordtab: {
        flex: 1,
        height: 33,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderColor: UColor.tintColor,
        borderWidth: 1,
        alignItems: 'center',   
        justifyContent: 'center', 
    },
    nothave: {
      height: Platform.OS == 'ios' ? 84.5 : 65,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 5,
      margin: 5,
  },  
  copytext: {
    fontSize: 16, 
    color: UColor.fontColor
   },
   nhaaout: {
    backgroundColor: '#4f617d',
  },
  wterout: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tabbutton: {  
    alignItems: 'center',   
    justifyContent: 'center', 
  },   
  inptoutsource: {
      marginTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 5,
      justifyContent: 'center',
      flexDirection: 'row',  
      alignItems: 'center',
  },
  outsource: {
      flexDirection: 'row',  
      alignItems: 'center',
  },
  inpt: {
    flex: 1, 
    color: UColor.fontColor, 
    fontSize: 15, 
    height: 45, 
    paddingLeft: 10, 
  },

  greenText: {
      flex:1,
    fontSize: 14, 
    color: "#42B324", 
    lineHeight: 35,
    textAlign: "left"
  },

  redText: {
    flex:1,
  fontSize: 14, 
  color: UColor.showy, 
  lineHeight: 35,
  textAlign: "left"
  },

  inptTitle: {
      flex: 1,
    fontSize: 14, 
    color: UColor.fontColor, 
    lineHeight: 35,
    textAlign: "right"
  },

  inptTitlered: {
    fontSize: 14, 
    color: UColor.showy, 
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
      width: 70, 
      height: 30,  
      borderRadius: 3, 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  botText: {
    fontSize: 17, 
    color: UColor.fontColor,
  },
     
  sliderow:{
    flex:1,
    // backgroundColor:UColor.mainColor,
    flexDirection:"row",
    padding: 10,
    // borderBottomColor: UColor.secdColor,
    borderBottomColor: '#4D607E',
    borderBottomWidth: 0.6,
    height: 30, 
  },

  touchableouts: {
    flex: 1,
    flexDirection: "column",
  },
  touchable: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    backgroundColor: UColor.mask,
  },
  touchableout: {
    width: (maxWidth * 2)/ 3, 
    height: maxHeight, 
    backgroundColor: '#4D607E', 
    alignItems: 'center', 
    paddingTop: 40,
  },
  touchablelist: {
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: '#4D607E', 
  },

  imgBtn: {
    width: 30,
    height: 30,
    margin:5,
  },
  
  ebhbtnout: {
    width: '100%', 
    height: 30, 
    flexDirection: "row", 
    alignItems: 'flex-start', 
    borderTopWidth: 1, 
    borderTopColor: UColor.mainColor, 
    backgroundColor:'#586888',
   },
   ebhbtnout2: {
    width: '100%', 
    height: 30, 
    flexDirection: "column", 
    alignItems: 'flex-start', 
    borderTopWidth: 1, 
    borderTopColor: UColor.mainColor, 
    backgroundColor:'#4D607E',
   },
    establishout: {
      flex: 1, 
      flexDirection: "row",
      alignItems: 'center', 
      height: 30, 
    },
    establishimg:{
      width: 25, 
      height: 25, 
    },

    greenincup:{
        fontSize:15,
        color:'#25B36B',
      },
    redincdo:{
        fontSize:15,
        color:'#F25C49',
    },

});

export default Transaction;
