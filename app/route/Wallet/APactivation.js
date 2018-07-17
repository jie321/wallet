import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Clipboard, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity,TouchableHighlight,KeyboardAvoidingView } from 'react-native';
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
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class APactivation extends BaseComponent {

  static navigationOptions = {
    title: '账号支付激活',
    headerStyle:{
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  constructor(props) {
    super(props);
    this.state = {
      walletName: "",
      walletPassword: "",
      reWalletPassword: "",
      passwordNote: "",
      isChecked: this.props.isChecked || true,
      integral: 0,
      weak: UColor.arrow,
      medium: UColor.arrow,
      strong: UColor.arrow,
      CreateButton:  UColor.mainColor,
      errorcode: '',
      errormsg: '',
    }
  }

  componentDidMount() {
    this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
      this.setState({integral: data.data});
    } });
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
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
  importPkey() {
     // 备份私钥
     const { navigate } = this.props.navigation;
     navigate('BackupsPkey');
  }


  createWallet() {
    AnalyticsUtil.onEvent('Create_wallet');
    const { dispatch } = this.props;
    if (this.state.walletName == "") {
      EasyToast.show('请输入钱包名称');
      return;
    }
    if(this.state.walletName.length != 12 ){
      EasyToast.show("钱包名称只能输入12位小写字母a-z和数字1-5");
      return;
    }
    if(this.state.walletName.length == 12 && !/^[1-5a-z.]+$/.test(this.state.walletName)){
      EasyToast.show("钱包名称只能输入12位小写字母a-z和数字1-5");
      return;
    }
    if (this.state.walletPassword == "" || this.state.walletPassword.length < 8) {
      EasyToast.show('钱包密码长度至少8位,请重输');
      return;
    }
    if (this.state.reWalletPassword == "" || this.state.reWalletPassword.length < 8) {
      EasyToast.show('钱包密码长度至少8位,请重输');
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
    try {
      Eos.seedPrivateKey(wordsStr_owner, wordsStr_active, (result) => {

        if (result.isSuccess) {
          var salt;
          Eos.randomPrivateKey((r) => {
            salt = r.data.ownerPrivate.substr(0, 18);
            result.data.words = wordsStr_owner;
            result.data.words_active = wordsStr_active;
            result.password = this.state.walletPassword;
            result.name = this.state.walletName;
            result.account = this.state.walletName;
            result.salt = salt;
            this.props.dispatch({type: 'wallet/createAccountService', payload: {username: result.account, owner: result.data.ownerPublic, active: result.data.activePublic, isact: false},
            callback: (data) => {
                EasyLoading.dismis();
                this.setState({
                  errorcode: data.code,
                  errormsg: data.msg
                });
                if (data.code == '0') {
                  result.isactived = true
                  this.props.dispatch({type: 'wallet/saveWallet', wallet: result, callback: (data, error) => {
                      DeviceEventEmitter.emit('updateDefaultWallet');
                      if (error != null) {
                        // EasyToast.show('生成账号失败：' + error);
                        this.ExplainPopup();
                      } else {
                        EasyToast.show('生成账号成功');
                        this.props.dispatch({
                          type: 'wallet/updateGuideState',
                          payload: {
                            guide: false
                          }
                        });
                        DeviceEventEmitter.emit('updateDefaultWallet');
                        this.props.navigation.goBack();
                        // const { navigate } = this.props.navigation;
                        // navigate('BackupNote', data); 
                      }
                    }
                  });
                } else if (data.code == '515') { // 511: 已经创建过账户， 515：账户已经被占用
                  // EasyToast.show('生成账号失败：' + data.msg + " 错误码：" + data.code);
                  this.ExplainPopup();
                } else {
                  result.isactived = false
                  this.props.dispatch({
                    type: 'wallet/saveWallet',
                    wallet: result,
                    callback: (data) => {
                      DeviceEventEmitter.emit('updateDefaultWallet');
                      if (this.props.navigation.state.params.entry == "wallet_home") {
                        this.props.dispatch({
                          type: 'wallet/updateGuideState',
                          payload: {
                            guide: false
                          },
                          callback: (data) => {
                            this.props.navigation.goBack();
                          }
                        });
                      }
                      // const { navigate } = this.props.navigation;
                      this.ExplainPopup();
                    }
                  });
                  // EasyToast.show('生成账号失败：' + data.msg + " 错误码：" + data.code);
                  this.ExplainPopup();
                }
              }
            })
          });
        }
      });
    } catch (error) {
      EasyToast.show(error);
    }
    EasyLoading.dismis();
    DeviceEventEmitter.addListener('wallet_10', () => {
      EasyToast.show('您不能创建更多钱包账号了');
    });

    DeviceEventEmitter.addListener('active_wallet', (tab) => {
      this.props.navigation.goBack();
    });
  }

  ExplainPopup(){
  EasyDialog.show("EOS账号创建说明", (<View>
     <View style={{flexDirection: 'column', marginBottom: 10,}}>
       <Text style={{textAlign: 'left', color: UColor.showy,}}>生成账号失败：{this.state.errormsg}</Text>
       <Text style={{textAlign: 'left', color: UColor.showy,}}>错误码：{this.state.errorcode}</Text>
     </View>
     <Text style={styles.inptpasstext}>1.如果您没有注册EosToken账号，创建的EOS钱包将无法激活</Text>
     <Text style={styles.inptpasstext}>2.激活EOS钱包需达到{this.state.integral}点积分（每个用户仅限一个）</Text>
     <Text style={styles.inptpasstext}>3.活跃用户每天均可获得对应的积分（详情参考积分细则）</Text>
     <Text style={styles.Becarefultext}>注意：不要向未激活的钱包进行转账！</Text>
  </View>), "知道了", null, () => {
    EasyDialog.dismis();
    this.props.navigation.goBack();
  }, () => { EasyDialog.dismis() });
  }

  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
    this._lrpass.blur();
    this._lnote.blur();
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
    if(this.state.walletName != "" && this.state.walletPassword != "" && this.state.reWalletPassword != ""){
      this.state.CreateButton = UColor.tintColor;
    }else{
      this.state.CreateButton =  UColor.mainColor;
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
          <View style={styles.significantout}>
            <Text style={styles.significanttext} >EOSgfds123415</Text>
            <Text style={styles.nametext} >EOS 账号</Text>
          </View>
          <View style={styles.outsource}>
            <Text style={{fontSize: 14, color: UColor.arrow, textAlign: 'right', marginHorizontal: 10, marginVertical: 5,}}>账号资源配置</Text>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>CPU抵押(EOS)</Text>
                    <Text style={styles.falsehints}>*该内容输入有误！</Text>
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.1" underlineColorAndroid="transparent" onChange={this.intensity()} 
                        keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>分配内存(Bytes)</Text>
                    <Text style={styles.falsehints}>*该内容输入有误！</Text>
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.397" underlineColorAndroid="transparent" onChange={this.intensity()} 
                        keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>网络抵押(EOS)</Text>
                    <Text style={styles.falsehints}>*该内容输入有误！</Text>
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.walletName} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0" underlineColorAndroid="transparent" onChange={this.intensity()} 
                        keyboardType="default" maxLength={12} onChangeText={(walletName) => this.setState({ walletName })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
          </View>
          <View style={styles.inptoutbg}>
            <View style={styles.inptoutgo} >
                <Text style={styles.inptitle}>ActivePrivateKey</Text>
                <Text style={styles.inptext}>dfsJHJKDkahjdsfnmbsfjkahiowekwdmsamsnabdHJKHDSJKdm,sanbfmds1233</Text>
            </View>
            <View style={styles.inptoutgo} >
                <Text style={styles.inptitle}>OwnerPrivateKey</Text>
                <Text style={styles.inptext}>dfsJHJKDkahjdsfnmbsfjkahiowekwdmsamsnabdHJKHDSJKdm,sanbfmADS</Text>
            </View>
          </View>
          <View style={styles.clauseout}>
            <TouchableHighlight  onPress={() => this.checkClick()}>
              <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={styles.clauseimg} />
            </TouchableHighlight>
            <Text style={styles.welcome} >我已经仔细阅读并同意 <Text onPress={() => this.prot()} style={styles.clausetext}>服务及隐私条款</Text></Text>
          </View>
        </KeyboardAvoidingView>
        <Button onPress={() => this.createWallet()}>
          <View style={styles.createWalletout} backgroundColor = {this.state.CreateButton}>
            <Text style={styles.createWallet}>创建钱包</Text>
          </View>
        </Button>
        <Button onPress={() => this.importWallet()}> 
          <View style={styles.createWalletout}>    
            <Text style={styles.importWallettext}>导入钱包</Text>
          </View>
        </Button>
        <Button onPress={() => this.importPkey()}> 
          <View style={styles.createWalletout}>    
            <Text style={styles.importWallettext}>备份私钥</Text>
          </View>
        </Button>
      </TouchableOpacity>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        marginBottom: 10,
    },
    inptoutgo: {
        paddingBottom: 15,
        backgroundColor: UColor.mainColor,
        borderBottomWidth: 1,
        borderBottomColor: UColor.secdColor,
    },
    inptgo: {
        flex: 1,
        paddingHorizontal: 10,
    },
    inptext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },





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
  significantout: {
      marginTop:10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UColor.mainColor
  },
  significanttext: {
    color: UColor.fontColor,
    fontSize: 24,
  },
  nametext: {
    color: UColor.arrow,
    fontSize: 16,
  },

  outsource: {
    backgroundColor: UColor.secdColor,
  },

  inptout: {
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: UColor.mainColor,
  },
  rankout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inptitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 30,
    paddingLeft: 5,
    color: UColor.fontColor,
  },
  falsehints: {
    fontSize: 12,
    color: UColor.showy,
    textAlign: 'right',
  },
  inpt: {
    flex: 4,
    color: UColor.arrow,
    fontSize: 15,
    height: 40,
    paddingLeft: 2
  },

  company: {
      textAlign: 'center',
      flex: 1,
     fontSize: 14,
     color: UColor.arrow
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
    marginHorizontal: 10, 
  },
  welcome: {
    fontSize: 14,
    color: UColor.arrow,
  },
  clausetext: {
    fontSize: 14,
    color: UColor.tintColor,
  },
  createWalletout: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
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

export default APactivation;