import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Clipboard, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity,TouchableHighlight } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyLoading } from '../../components/Loading';
import { EasyDialog } from "../../components/Dialog";
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import { english } from '../../utils/english';
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class createWallet extends React.Component {

  static navigationOptions = {
    title: '创建钱包'
  };

  constructor(props) {
    super(props);
    this.state = {
      walletName: "",
      walletPassword: "",
      reWalletPassword: "",
      passwordNote: "",
      isChecked: this.props.isChecked || false,
      integral: 0,
      weak: UColor.arrow,
      medium: UColor.arrow,
      strong: UColor.arrow,
    }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
      this.setState({integral: data.data});
    } });
  }

  importKey() {
     // 钱包
     const { navigate } = this.props.navigation;
    navigate('ImportKey', {});
  }
  
  importWallet() {
    // 导入钱包
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey');
    // EasyToast.show('测试网络暂不开放');
  }


  createWallet() {
    AnalyticsUtil.onEvent('Create_wallet');
    const { dispatch } = this.props;
    if (this.state.walletName == "") {
      EasyToast.show('请输入钱包名称');
      return;
    }
    if(!/^[1-5a-z.]+$/.test(this.state.walletName)){
      EasyToast.show("钱包名称只能输入小写字母a-z和数字1-5");
      return;
    }
    if (this.state.walletPassword == "") {
      EasyToast.show('请输入钱包密码');
      return;
    }
    if (this.state.reWalletPassword == "") {
      EasyToast.show('请输入钱包确认密码');
      return;
    }
    if (this.state.walletPassword != this.state.reWalletPassword) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.isChecked == false) {
      EasyToast.show('请确认已阅读并同意条款');
      return;
    }

    var arr_owner = [];
    var arr_active = [];
    var words_owner = [];
    var words_active = [];
    var wordsStr_owner = '';
    var wordsStr_active = '';
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_owner);
      words_owner.push(english[randomNum]);
    }
    for (var i = 0; i < arr_owner.length; i++) {
      words_owner[i] = english[arr_owner[i]];
      wordsStr_owner = wordsStr_owner + "," + words_owner[i];
    }
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_active);
      words_active.push(english[randomNum]);
    }
    for (var i = 0; i < arr_active.length; i++) {
      words_active[i] = english[arr_active[i]];
      wordsStr_active = wordsStr_active + "," + words_active[i];
    }
    const { navigate } = this.props.navigation;
    this.clearFoucs();
    EasyLoading.show('正在请求');
    Eos.seedPrivateKey(wordsStr_owner, wordsStr_active, (result) => {
      if (result.isSuccess) {
        var salt;
        Eos.randomPrivateKey((r)=>{
            salt = r.data.ownerPrivate.substr(0, 18);
            result.data.words = wordsStr_owner;
            result.data.words_active = wordsStr_active;
            result.password = this.state.walletPassword;
            result.name = this.state.walletName;
            result.account = this.state.walletName;
            result.salt = salt;
            this.props.dispatch({
              type: 'wallet/createAccountService', payload: { username: result.account, owner: result.data.ownerPublic, active: result.data.activePublic,isact:false }, callback: (data) => {
                EasyLoading.dismis();
                this.setState({
                  integral: data.data,
                })
                if (data.code == '0') {
                  result.isactived = true
                  this.props.dispatch({
                    type: 'wallet/saveWallet', wallet: result, callback: (data,error) => {
                      DeviceEventEmitter.emit('updateDefaultWallet');
                      if (error != null) {
                        EasyToast.show('生成账号失败：' + error);
                        this.ExplainPopup();
                      } else {
                        EasyToast.show('生成账号成功');
                        DeviceEventEmitter.emit('updateDefaultWallet');
                        this.props.navigation.goBack();
                        // const { navigate } = this.props.navigation;
                        // navigate('BackupNote', data);
                        
                      }
                    }
                  });
                }else if(data.code != '515') {
                  result.isactived = false
                  this.props.dispatch({
                    type: 'wallet/saveWallet', wallet: result, callback: (data) => {
                      DeviceEventEmitter.emit('updateDefaultWallet');
                      this.props.navigation.goBack();
                      // const { navigate } = this.props.navigation;
                    }
                  });
                  EasyToast.show('生成账号失败：' + data.msg + " 错误码：" + data.code);
                  this.ExplainPopup();
                }else {
                  EasyToast.show('生成账号失败：' + data.msg + " 错误码：" + data.code);
                  this.ExplainPopup();
                }
              }
            })
        });

      } else {
        EasyLoading.dismis();
      }

    });

    DeviceEventEmitter.addListener('wallet_10', () => {
      EasyToast.show('您不能创建更多钱包账号了');
    });

    DeviceEventEmitter.addListener('active_wallet', (tab) => {
      this.props.navigation.goBack();
    });
  }

  ExplainPopup(){
  EasyDialog.show("EOS账号创建说明", (<View>
     <Text style={styles.inptpasstext}>1.如果你没有注册EosToken账号，创建的EOS钱包将 无法激活</Text>
     <Text style={styles.inptpasstext}>2.激活EOS钱包需达到{this.state.integral}点积分（每个用户仅限一个）</Text>
     <Text style={styles.inptpasstext}>3.活跃用户每天均可获得对应的积分（详情参考积分细则）</Text>
     <Text style={styles.Becarefultext}>注意：不要向未激活的钱包进行转账！</Text>
  </View>), "知道了", null,  () => { EasyDialog.dismis() });
  }

  getRandomWords() {
    var words = '';
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_owner);
      words_owner.push(english[randomNum]);
    }
    for (var i = 0; i < arr_owner.length; i++) {
      words_owner[i] = english[arr_owner[i]];
      wordsStr_owner = wordsStr_owner + "," + words_owner[i];
    }
    return words;
  }


  getAccountInfo() {
    Eos.balance("eosio.token", "morning", (r) => {
      try {
        alert('getAccountInfo: ' + JSON.stringify(r));
      } catch (e) {
        alert('getAccountInfo err: ' + JSON.stringify(e));
      }
    });
  }


  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
    this._lrpass.blur();
    this._lnote.blur();
  }

  transfer() {
    Eos.transfer("tt", "marco", "1.0000 EOS", "", "5JqqwFTALaJPVtSRNhsVFFN5de7d6j239YSVDMeKfNHXYc5F2oP", false, (r) => {
      alert(JSON.stringify(r));
      this.props.dispatch({
        type: 'wallet/pushTransaction', payload: r.data.transaction, callback: (data) => {
          alert('pushTransaction :' + JSON.stringify(data));
        }
      });
    });
  }

  getx(arr) {
    for (var i = 0; i > -1; i++) {
      var flag = true;
      var num = Math.floor(Math.random() * english.length);
      for (var i in arr) {
        if (arr[i] == num) {
          flag = false;
          break;
        }
      }
      if (flag == true) {
        arr.push(num);
        return arr;
      }
    }
  }

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
  }


  checkClick() {
    this.setState({
      isChecked: !this.state.isChecked
    });
  }

  intensity() {
    let string = this.state.walletPassword;
    if(string.length >=8) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.strong = UColor.tintColor;
        this.state.medium = UColor.arrow;
        this.state.weak = UColor.arrow;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else{
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.arrow;
          this.state.weak = UColor.tintColor;
        }
      }
     }else{
      this.state.strong = UColor.arrow;
      this.state.medium = UColor.arrow;
      this.state.weak = UColor.arrow;
     }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
        <Text style={styles.significanttext} >重要声明:</Text>
        <Text style={styles.significanttext} >密码用于保护私钥和交易授权，强度非常重要</Text>
        <Text style={styles.significanttext} >EosToken不存储密码，也无法帮您找回，请务必牢记</Text>
        <View style={styles.outsource}>
          <View style={styles.inptout} >
            <Text style={styles.inptitle}>账号名称</Text>
            <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
              selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
              placeholder="账号名称(只能输入12位小写字母a-z及数字1-5)" underlineColorAndroid="transparent" 
              keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName })} 
            />
          </View>
          <View style={styles.inptout} >
              <View style={{flexDirection: 'row',}}>
                <Text style={styles.inptitle}>设置密码</Text>
                <View style={{flexDirection: 'row',}}>
                    <Text style={{color:this.state.weak, fontSize: 15, padding: 5,}}>弱</Text>
                    <Text style={{color:this.state.medium, fontSize: 15, padding: 5,}}>中</Text>
                    <Text style={{color:this.state.strong, fontSize: 15, padding: 5,}}>强</Text>
                </View>
              </View>
              <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletPassword}  returnKeyType="next" editable={true}
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} autoFocus={false}
                  onChangeText={(walletPassword) => this.setState({walletPassword})} onChange={this.intensity()} 
                  placeholder="输入密码至少8位,建议大小字母与数字混合" underlineColorAndroid="transparent" secureTextEntry={true} 
                />
          </View>
          <View style={styles.inptout} >
            <Text style={styles.inptitle}>确认密码</Text>
            <TextInput ref={(ref) => this._lrpass = ref} value={this.state.reWalletPassword} returnKeyType="next"
              selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
              placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} 
              onChangeText={(reWalletPassword) => this.setState({ reWalletPassword })}  autoFocus={false} editable={true}
            />
          </View>
          <View style={styles.inptout} >
            <TextInput ref={(ref) => this._lnote = ref} value={this.state.passwordNote} returnKeyType="go"
              selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
              placeholder="密码提示(可不填)" underlineColorAndroid="transparent" secureTextEntry={true} 
              onChangeText={(passwordNote) => this.setState({ passwordNote })} autoFocus={false} editable={true}
            />
          </View>
        </View>

        <View style={styles.clauseout}>
          <TouchableHighlight  onPress={() => this.checkClick()}>
            <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={styles.clauseimg} />
          </TouchableHighlight>
          <Text style={styles.welcome} >我已经仔细阅读并同意</Text>
          <Text onPress={() => this.prot()} style={styles.clausetext}>服务及隐私条款</Text>
        </View>
        <Button onPress={() => this.createWallet()}>
          <View style={styles.createWalletout}>
            <Text style={styles.createWallet}>创建钱包</Text>
          </View>
        </Button>
        <Button onPress={() => this.importWallet()}>     
            <Text style={styles.importWallettext}>导入钱包</Text>
        </Button>
      </TouchableOpacity>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
  inptpasstext: {
    fontSize: 12,
    color: UColor.arrow,
    marginBottom: 15,
    lineHeight: 20,
  },
  Becarefultext: {
     color: UColor.showy,
     fontSize: 12,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  significanttext: {
    color: UColor.arrow,
    marginHorizontal: 10,
    marginVertical: 5,
  },

  outsource: {
    backgroundColor: UColor.mainColor,
  },

  inptout: {
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    backgroundColor: UColor.mainColor,
    borderBottomColor: UColor.secdColor,
  },
  inptitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 30,
    paddingLeft: 5,
    color: UColor.fontColor,
  },
  inpt: {
    color: UColor.arrow,
    fontSize: 15,
    height: 50,
    paddingLeft: 2
  },

  clauseout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  clauseimg: { 
    width: 20, 
    height: 20, 
  },
  welcome: {
    fontSize: 15,
    color: UColor.arrow,
    marginLeft: 20
  },
  clausetext: {
    fontSize: 15,
    color: UColor.tintColor,
    marginLeft: 5
  },
  createWalletout: {
    height: 45,
    backgroundColor: UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 5
  },
  createWallet: {
    fontSize: 15,
    color: UColor.fontColor
  },
  importWallettext: {
    fontSize: 15,
    color: UColor.tintColor,
    textAlign: 'center'
  },

});

export default createWallet;