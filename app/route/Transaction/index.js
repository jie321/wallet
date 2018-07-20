import React from 'react';
import { connect } from 'react-redux'
import {ProgressBarAndroid,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,StatusBar} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
var ScreenWidth = Dimensions.get('window').width;
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import ProgressBar from '../../components/ProgressBar';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons'

const type = 1;
let timer;

@connect(({coinLine,sticker}) => ({...coinLine,...sticker}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          headerTitle: "RAM交易",
          headerStyle: {
            paddingTop: Platform.OS == "ios" ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
        //   headerRight: (
        //     // <Button name="share" onPress={() => this._rightTopClick()} >
        //       <View style={{ padding: 15 }}>
        //       <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
        //       </View>
        //     // </Button>
        //   )
        };
      };

  componentWillMount() {

    super.componentWillMount();

    // const c = this.props.navigation.state.params.coins;
    const c = this.state.coins;
    this.props.dispatch({type: 'coinLine/clear',payload:{id:c.id}});

    if(this.props.coinSelf && this.props.coinSelf[c.name.toLowerCase()]==1){
      this.props.navigation.setParams({img:UImage.fav_h,onPress:this.onPress});
    }else{
      this.props.navigation.setParams({img:UImage.fav,onPress:this.onPress});
    }
  }

  // onPress = () =>{
  //   // const c = this.props.navigation.state.params.coins;
  //   const c = this.state.coins;
  // }

  constructor(props) {
    super(props);
    // this.props.navigation.setParams({ onPress: this._rightTopClick });

    this.state = {
      selectedSegment:"1小时",
      selectedTrackSegment:"最近交易",

      isBuy: true,
      isSell: false,
      isTxRecord: false,
      isTrackRecord: false,

      balance: '0.0000',   

      ram_available:'0',   //可用ram 字节数
      Currentprice: '0',   //当前ram价格

      buyRamAmount: "",    //输入购买的额度
      sellRamBytes: "",    //输入出售的字节数
      queryaccount:"",     //查询账户 

      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      coins:{
          code : "eos",
          id:27,
          img: "http://static.eostoken.im/images/20180319/1521432637907.png",
          increase: 8.21,
          max: 54.1535,
          min: 48.4136,
          name: "EOS",
          price: 52.6686,
          start: 48.7865,
          txs: 8389205,
          usd: 7.938,
          value: 7144200000,
      }
   };
  }

  _rightTopClick = () => {
    // DeviceEventEmitter.emit(
    //   "turninShare",
    //   '{"toaccount":"' +
    //     this.props.defaultWallet.account +
    //     '","amount":"' +
    //     this.state.amount +
    //     '","symbol":"EOS"}'
    // );
  };

  componentDidMount(){
    // const c = this.props.navigation.state.params.coins;
    const c = this.state.coins;
    this.fetchLine(1,'1小时');
    this.props.dispatch({type: 'coinLine/info',payload:{id:c.id}});
   
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        this.getBalance();
    }});
   
    //加载先获取
    this.props.dispatch({ type: 'sticker/listincrease', payload: { type: 0}, callback: (data) => { 
      if(data == undefined || data == null){
        reurn;
      }
      if(data[0]){
        this.setState({coins: data[0]});
      }
    } });

    this.props.dispatch({
      type: 'wallet/getDefaultWallet',
      callback: (data) => {
        if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            return;
          }
          this.getAccountInfo();

      }
  });

    this.props.dispatch({
      type: 'vote/getqueryRamPrice',
      payload: {},
      callback: (data) => {
          this.setState({
              Currentprice: data.data ? data.data : '0.00000'
          });
      }
  });

    InteractionManager.runAfterInteractions(() => {
       //开定时器，刷新
      clearInterval(timer);
      timer = setInterval(() => {
          const {dispatch}=this.props;
          dispatch({ type: 'sticker/listincrease', payload: { type: 0}, callback: (data) => { 
            if(data == undefined || data == null){
              reurn;
            }
            if(data[0]){
              this.setState({coins: data[0]});
            }
         } });

          // this.setState({showText: true});
          // this.setState(preState => {
          //   return { showText: !preState.showText };
          // });
        }, 7000);
    });
    
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    //关闭定时器
    if(timer){
      clearInterval(timer);
    }
  }

  getAccountInfo(){
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      this.setState({ ram_available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(2)});
          this.getInitialization(); 
    } });
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name , symbol: 'EOS' }, callback: (data) => {
            this.setState({ currency_surplus:data?data.data.replace('EOS', "") :'0',});
    }});
  } 
  getInitialization() {
    if(this.state.isBuy){
        this.goPage('isBuy');
      }else if(this.state.isSell){
        this.goPage('isSell');
      }else{
        // this.goPage('isBuyForOther');
      }   
  }

  fetchLine(type,opt){
    this.setState({selectedSegment:opt});
    const {dispatch} =  this.props;
    // const c = this.props.navigation.state.params.coins;
    const c = this.state.coins;
    InteractionManager.runAfterInteractions(() => {
      dispatch({type:'coinLine/list',payload:{coin:c.name,type}});
    });
  }

  setSelectedOption(opt){
    if(opt=="5分钟"){
      type=0;
      this.fetchLine(0,opt);
    }else if(opt=="1小时"){
      type=1;
      this.fetchLine(1,opt);
    }else if(opt=="6小时"){
      type=2;
      this.fetchLine(2,opt);
    }else if(opt=="24小时"){
      type=3;
      this.fetchLine(3,opt);
    }
  }

  fetchTrackLine(type,opt){
    this.setState({selectedTrackSegment:opt});
    if(type == 0){
        EasyToast.show('待实现，查询区块最近交易记录');   
        // InteractionManager.runAfterInteractions(() => {
        //     dispatch({type:'coinLine/list',payload:{coin:c.name,type}});
        //   });
    }else{
        EasyToast.show('待实现，查询区块持量大户前10名记录');   
    }
  }

  setSelectedTrackOption(opt){
    if(opt=="最近交易"){
      type=0;
      this.fetchTrackLine(0,opt);
    }else {
      type=1;
      this.fetchTrackLine(1,opt);
    }
  }

  getBalance() {
    // if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
    //   return;
    // }
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: "eosbille1234", symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            if (data.data == "") {
              this.setState({
                balance: '0.0000 EOS',
              })
            } else {
                this.setState({ balance: data.data });
            }
          } else {
            // EasyToast.show('获取余额失败：' + data.msg);
          }
          // EasyLoading.dismis();
        }
      })
}

  goPage(current) {
    if (current == 'isBuy'){
        // EasyToast.show('买');
    }else if (current == 'isSell'){
        // EasyToast.show('卖');
    }else if (current == 'isTxRecord'){
         EasyToast.show('待实现,查询区块最近的20笔交易记录');
    }
    else if (current == 'isTrackRecord'){
          
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
    // 返回内存，计算，网络，内存交易  
    resourceButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell','isTxRecord', 'isTrackRecord'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: '#7787A3'}]}>{buttonTitle}</Text>  
            </TouchableOpacity>  
        );  
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

  //转换时间
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
  
  //寻找
  serach = (rowData) =>{
    // this.props.dispatch({ type: 'wallet/getDefaultWallet' });
    this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.state.queryaccount, contract_account : "eosio.token",  code : "eos", start_account_action_seq: "-1"}, callback: (resp) => {
        if(resp.code != '0'){
            EasyToast.show("暂未找到交易哟~");
        }else if((resp.code == '0') && (this.props.DetailsData.length == 0)){
            EasyToast.show("您还没有交易哟~");
        }
        EasyLoading.dismis();
    }});  
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
                if(this.state.isOwn){
                    this.state.receiver = this.props.defaultWallet.account;
                }
                Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.buyRamAmount + " EOS", (r) => {
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
    if(!this.props.defaultWallet){
        EasyToast.show('请先创建钱包');
        return;
    }
    if(this.state.sellRamBytes == ""){
        EasyToast.show('请输入出售内存kb数量');
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存kb数量')){
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

  //输入购买数量占总余额的比例
  getBuyRamRadio()
  {
     var balance = this.state.balance == ""? "0.0000" :this.state.balance.replace("EOS", "");
     var ratio = 0;             //进度条比例值
     try {
        if(this.state.buyRamAmount){
            if(balance){
                //余额存在且大于0
                var tmpbuyRamAmount = 0;
                var tmpbalance = 0; 
                try {
                    tmpbuyRamAmount = parseFloat(this.state.buyRamAmount);
                    tmpbalance = parseFloat(balance);
                  } catch (error) {
                    tmpbuyRamAmount = 0;
                    tmpbalance = 0;
                }
                if(tmpbuyRamAmount > tmpbalance)
                {
                    //余额不足
                    this.setState({buyRamAmount:""});         
                    EasyToast.show("您的余额不足,请重输");           
                }else if(tmpbalance > 0){
                    ratio = tmpbuyRamAmount / tmpbalance;
                }
            }
        }
     } catch (error) {
        ratio = 0;
     }
     return ratio;
  }
  //输入卖掉的字节数占总字节的比例
  getSellRamRadio()
  {
     var ratio = 0;             //进度条比例值
     try {
         if(this.state.sellRamBytes)
         {
             if(this.state.ram_available){
                //可用字节数存在且大于0
                var tmpsellRamBytes = 0;
                var tmpram_available = 0; 
                try {
                    tmpsellRamBytes = parseFloat(this.state.sellRamBytes);
                    tmpram_available = parseFloat(this.state.ram_available);
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
  render() {
    // const c = this.props.navigation.state.params.coins;
    const c = this.state.coins;
    return <View style={styles.container}>
     <ScrollView style={styles.scrollView}>
      <View>
          <View style={{flex:1,flexDirection:'row'}}>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <Text style={{color:'#8696B0',fontSize:11,textAlign:'center'}}>开盘</Text>
              <Text style={{color:'#fff',fontSize:15,marginTop:2,textAlign:'center'}}>{c.start}</Text>
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <Text style={{color:'#8696B0',fontSize:11,textAlign:'center'}}>最高</Text>
              <Text style={{color:'#fff',fontSize:15,marginTop:2,textAlign:'center'}}>{c.max}</Text>
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <Text style={{color:'#8696B0',fontSize:11,textAlign:'center'}}>最低</Text>
              <Text style={{color:'#fff',fontSize:15,marginTop:2,textAlign:'center'}}>{c.min}</Text>
            </View>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <Text style={{color:'#8696B0',fontSize:11,textAlign:'center'}}>成交量</Text>
              <Text style={{color:'#fff',fontSize:15,marginTop:2,textAlign:'center'}}>{formatterNumber(c.txs)}</Text>
            </View>
          </View>
        
        <View style={{padding:10,paddingTop:5}}>
          <SegmentedControls 
          tint= {'#586888'}
          selectedTint= {'#43536D'}
          onSelection={this.setSelectedOption.bind(this) }
          selectedOption={ this.state.selectedSegment }
          backTint= {'#43536D'} options={['5分钟','1小时','6小时','24小时']} />
        </View>
        <View style={{flex:1,paddingTop:1}}>
          {
            <Echarts option={this.props.lineDatas?this.props.lineDatas:{}} width={ScreenWidth} height={200} />
          }
        </View>
        <View style={{justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#65CAFF'}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>价格走势</Text>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#556E95',marginLeft:10}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>交易量</Text>
        </View>
        <View style={styles.tablayout}>  
            {this.resourceButton(styles.buttontab, this.state.isBuy, 'isBuy', '买')}  
            {this.resourceButton(styles.buttontab, this.state.isSell, 'isSell', '卖')}  
            {this.resourceButton(styles.buttontab, this.state.isTxRecord, 'isTxRecord', '交易记录')}  
            {this.resourceButton(styles.buttontab, this.state.isTrackRecord, 'isTrackRecord', '大单追踪')}  
        </View> 
         {this.state.isBuy?<View>
              <Text style={styles.inptTitle}>余额:{this.state.balance==""? "0.0000" :this.state.balance.replace("EOS", "")}EOS</Text>
              <View style={styles.inptoutsource}>
                  <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                  selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                  placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                  onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                  />
                <Text style={{marginLeft: 10, borderRadius: 3, 
                      justifyContent: 'center', alignItems: 'center' }}>EOS</Text>
              </View>
              <View style={styles.inptoutsource}>
                  <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, height: 30, paddingLeft: 10, }}>≈{(this.state.buyRamAmount/this.state.Currentprice).toFixed(3)}</Text>
                  <Text style={{ fontSize: 15, height: 30, paddingLeft: 10, 
                        justifyContent: 'center', alignItems: 'center' }}>kb</Text>
              </View>
              <View style={styles.inptoutsource}>
                <View style={styles.outsource}>
                        <View style={{flex: 1, paddingLeft: 10, marginRight:18}}>
                          <ProgressBarAndroid clolor="blue" styleAttr='Horizontal' progress={this.getBuyRamRadio()}
                                        indeterminate={false} />
                          <View style={{fontSize: 12,color:  UColor.arrow,flex: 1,  flexDirection: 'row',  
                                    padding: 0,margin:0,marginTop:0  }}>
                            <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                              borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>0</Text>

                            <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                              borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>1/3</Text>     

                            <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                              borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>2/3</Text>

                            <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                              borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>ALL</Text>                                
                        </View>    
                        </View>
                        <Button onPress={this.buyram.bind()}>
                            <View style={styles.botn}>
                                <Text style={styles.botText}>买入</Text>
                            </View>
                        </Button> 
                    </View>
                </View>
          </View>:  
               <View>{this.state.isSell?
                  <View>
                  <Text style={styles.inptTitle}>可卖:{this.state.ram_available}KB</Text>
                  <View style={styles.inptoutsource}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes)})}
                      />
                      <Text style={{marginLeft: 10, borderRadius: 3, 
                          justifyContent: 'center', alignItems: 'center' }}>byte</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                  <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, height: 30, paddingLeft: 10, }}>≈{(this.state.sellRamBytes*this.state.Currentprice).toFixed(4)}</Text>
                      <Text style={{ fontSize: 15, height: 30, paddingLeft: 10, 
                            justifyContent: 'center', alignItems: 'center' }}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                           <View style={{flex: 1, paddingLeft: 10, marginRight:18}}>
                             <ProgressBarAndroid clolor="blue" styleAttr='Horizontal' progress={this.getSellRamRadio()}
                                            indeterminate={false} />
                             <View style={{fontSize: 12,color:  UColor.arrow,flex: 1,  flexDirection: 'row',  
                                        padding: 0,margin:0,marginTop:0  }}>
                                <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                                  borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>0</Text>

                                <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                                  borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>1/3</Text>     

                                <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                                  borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>2/3</Text>

                                <Text style={{  margin: 0, width: (ScreenWidth-130)/4, height: 33,
                                                  borderRadius: 10,alignItems: 'center',justifyContent: 'center',color:UColor.fontColor }}>ALL</Text>                                
                            </View>    
                            </View>
                            <Button onPress={this.sellram.bind()}>
                                <View style={styles.botn}>
                                    <Text style={styles.botText}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                </View>
            </View>:
                <View>{this.state.isTxRecord ? <View >
                   <View style={{      flexDirection: 'row', alignItems: 'center',borderBottomColor: UColor.secdColor, 
                                  borderBottomWidth: 0.5,}}>
                    <View style={{   flex: 1,paddingHorizontal: 20,justifyContent: 'center', }} >
                      <TextInput ref={(ref) => this._account = ref} value={this.state.queryaccount} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                            placeholder="请输入账户名称" underlineColorAndroid="transparent" keyboardType="default" 
                            onChangeText={(queryaccount) => this.setState({ queryaccount: this.chkAccount(queryaccount)})}
                        />
                    </View>     
                    <TouchableOpacity onPress={this.serach.bind()}>  
                        <View style={{ color: UColor.arrow,fontSize: 18,justifyContent: 'flex-end',paddingRight: 15}} >
                            <Image source={UImage.Magnifier} style={{ width: 30,height: 30}}></Image>
                        </View>
                    </TouchableOpacity> 
                 </View>
                 <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.DetailsData == null ? [] : this.props.DetailsData)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                       backgroundColor: UColor.mainColor,
                                      flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                      borderRadius: 5,margin: 5,}}>
                            <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                    <Text style={styles.timetext}>时间 : {this.transferTimeZone(rowData.blockTime)}</Text>
                                    <Text style={styles.quantity}>数量 : {rowData.quantity.replace(c.asset.name, "")}</Text>
                                </View>
                                <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                    {rowData.type == '转出' ? 
                                    <Text style={{fontSize: 14,color: UColor.tintColor,textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                    :
                                    <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                    }
                                    <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>（{rowData.description}）</Text>
                                </View>
                            </View>
                            <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                            </View>
                        </View>
                    </View>         
                     )}                
                 /> 
                 
            </View>: 
                 <View>

                 <View style={{padding:10,paddingTop:5}}>
                  <SegmentedControls 
                  tint= {'#586888'}
                  selectedTint= {'#43536D'}
                  onSelection={this.setSelectedTrackOption.bind(this) }
                  selectedOption={ this.state.selectedTrackSegment }
                  backTint= {'#43536D'} options={['最近交易','持量大户']} />
                </View>
                {this.state.selectedTrackSegment == '最近交易' ? 
                  <View>
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                      dataSource={this.state.dataSource.cloneWithRows(this.props.DetailsData == null ? [] : this.getTradeRecord())} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                      <View>
                          <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                        backgroundColor: UColor.mainColor,
                                        flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                        borderRadius: 5,margin: 5,}}>
                              <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                  <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                      <Text style={styles.timetext}>时间 : {this.transferTimeZone(rowData.blockTime)}</Text>
                                      <Text style={styles.quantity}>数量 : {rowData.quantity.replace(c.asset.name, "")}</Text>
                                  </View>
                                  <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                      {rowData.type == '转出' ? 
                                      <Text style={{fontSize: 14,color: UColor.tintColor,textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                      :
                                      <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                      }
                                      <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>（{rowData.description}）</Text>
                                  </View>
                              </View>
                              <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                  <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                              </View>
                          </View>
                      </View>         
                      )}                
                  /> 
                  </View> :
                  <View>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                        dataSource={this.state.dataSource.cloneWithRows(this.props.DetailsData == null ? [] : this.getTradeRecord())} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                        <View>
                            <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                          backgroundColor: UColor.mainColor,
                                          flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                          borderRadius: 5,margin: 5,}}>
                                <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                    <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                        <Text style={styles.timetext}>时间 : {this.transferTimeZone(rowData.blockTime)}</Text>
                                        <Text style={styles.quantity}>数量 : {rowData.quantity.replace(c.asset.name, "")}</Text>
                                    </View>
                                    <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                        {rowData.type == '转出' ? 
                                        <Text style={{fontSize: 14,color: UColor.tintColor,textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                        :
                                        <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>类型 : {rowData.type}</Text>
                                        }
                                        <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>（{rowData.description}）</Text>
                                    </View>
                                </View>
                                <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                    <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </View>         
                        )}                
                    /> 
                  </View>
                }
                  <Text style={{fontSize: 14,color: UColor.fontColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "center"}}>成交资金分布</Text>
                  <Text style={{fontSize: 12,color: UColor.tintColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "left"}}>{this.getTextPromp()}</Text>
                  <View style={{flex:1,paddingTop:1}}>
                    {
                      <Echarts option={
                   {
                            // title : {
                            //     text: '某站点用户访问来源',
                            //     subtext: '纯属虚构',
                            //     x:'center'
                            // },
                            // tooltip : {
                            //     trigger: 'item',
                            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                            // },
                            legend: {
                                orient: 'vertical',
                                left: 'left',
                                data: ['10%超大','10%大单','10%大中','15%中单','20%中小','35%小单']
                            },
                            series : [
                                {
                                    name: '',   //访问来源
                                    type: 'pie',
                                    radius : '55%',
                                    center: ['50%', '60%'],
                                    hoverAnimation: false,
                                    animation:false,
                                    roam:false,
                                    silent:true,
                                    data:[
                                        {value:335, name:'10%超大'},
                                        {value:310, name:'10%大单'},
                                        {value:234, name:'10%大中'},
                                        {value:135, name:'15%中单'},
                                        {value:1548, name:'20%中小'},
                                        {value:1548, name:'35%小单'}
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
                        
                        } width={ScreenWidth - 50} height={200} />
                    }
                  </View>
                 </View>}
               </View>}
            </View>
          }   
      </View>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
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
    fontSize:12,
    color:UColor.fontColor,
    backgroundColor:'#F25C49',
    padding:5,
    textAlign:'center',
    marginLeft:10,
    borderRadius:5,
    minWidth:60
  },
  incdo:{
    fontSize:12,
    color:UColor.fontColor,
    backgroundColor:'#25B36B',
    padding:5,
    textAlign:'center',
    marginLeft:10,
    borderRadius:5,
    minWidth:60
  },
   tablayout: {   
        flexDirection: 'row',  
        padding: 2,
        margin:2,marginTop:1
    },
    buttontab: {  
        margin: 5,
        width: (ScreenWidth-50)/4,
        height: 33,
        borderRadius: 10,
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
    paddingHorizontal: 20,
    paddingBottom: 5,
    justifyContent: 'center',

    flexDirection: 'row',  
    alignItems: 'center',
    borderBottomColor: UColor.secdColor, 
    borderBottomWidth: 0.5,
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
    paddingHorizontal: 25,
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
     scanningimg: {
        width:30,
        height:30,
        justifyContent: 'center', 
        alignItems: 'center'
    }
});

export default Transaction;
