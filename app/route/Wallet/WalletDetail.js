import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Clipboard, Text, ScrollView, Image, Platform, StatusBar, TextInput, Modal } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import Constants from '../../utils/Constants'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import JPushModule from 'jpush-react-native';
import JPush from '../../utils/JPush'
const maxWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet, login }) => ({ ...wallet, ...login }))
class WalletDetail extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: params.data.name,
      headerStyle: {
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
      },

    };
  };


  constructor(props) {
    super(props);
    this.config = [
      { first: true, name: "修改密码", onPress: this.goPage.bind(this, "ModifyPassword") },
      { first: true, name: "导出公钥", onPress: this.goPage.bind(this, "ExportPublicKey") },
      { name: "导出私钥", onPress: this.goPage.bind(this, "ExportPrivateKey") },
    ];
    this.state = {
      password: '',
      show: false,
      txt_owner: '',
      txt_active: '',
      integral: 0,
      accumulative: 0,
      showpublickey: false,
      txt_ownerpublic: '',
      txt_activepublic: '',
    }
    DeviceEventEmitter.addListener('modify_password', () => {
      this.props.navigation.goBack();
    });
  }

    //组件加载完成
    componentDidMount() {
      this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
        this.setState({integral: data.data});
      } });
      //推送初始化
      const { navigate } = this.props.navigation;
      JPush.init(navigate);
    }

  _rightButtonClick() {
    //   console.log('右侧按钮点击了');  
    this._setModalVisible();
  }

  // 显示/隐藏 modal  
  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  _setModalVisiblePublicKey() {
    let isShow = this.state.showpublickey;
    this.setState({
      showpublickey: !isShow,
    });
  }

  goPage(key, data = {}) {
    const { navigate, goBack } = this.props.navigation;
    if (key == 'ExportPrivateKey') {
      const view =
        <View style={styles.passoutsource}>
          <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
            selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass}
            placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent" />
        </View>
      EasyDialog.show("密码", view, "确定", "取消", () => {
        if (this.state.password == "") {
          EasyToast.show('请输入密码');
          return;
        }
        try {
          var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
          var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
          var activePrivateKey = this.props.navigation.state.params.data.activePrivate;
          var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
          if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            plaintext_words_active = plaintext_words_active.substr(8, plaintext_words_active.length);
            plaintext_words_owner = plaintext_words_owner.substr(8, plaintext_words_owner.length);
            this.setState({
              txt_active: plaintext_words_active,
              txt_owner: plaintext_words_owner
            });
            this._setModalVisible();
            // alert('解锁成功' + plaintext_words);
            // this.toBackup(wordsArr);
          } else {
            EasyToast.show('您输入的密码不正确');
          }
        } catch (error) {
          EasyToast.show('您输入的密码不正确');
        }
        EasyDialog.dismis();
      }, () => { EasyDialog.dismis() });
    } else if(key == 'ExportPublicKey') {
      var ownerPublicKey = this.props.navigation.state.params.data.ownerPublic;
      var activePublicKey = this.props.navigation.state.params.data.activePublic;
      this.setState({
        txt_activepublic: activePublicKey,
        txt_ownerpublic: ownerPublicKey
      });
      this._setModalVisiblePublicKey();
    } else if (key == 'ModifyPassword') {
      navigate('ModifyPassword', this.props.navigation.state.params.data);
    } else {
      // EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  importWallet() {
    const { navigate, goBack } = this.props.navigation;
    navigate('ImportKey', this.props.navigation.state.params.data);
  }

  copy() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
    Clipboard.setString('OwnerPrivateKey: ' + this.state.txt_owner + "\n" + 'ActivePrivateKey: ' + this.state.txt_active);
    EasyToast.show("复制成功")
  }

  copyPublicKey() {
    this._setModalVisiblePublicKey();
    Clipboard.setString('OwnerPublicKey: ' + this.state.txt_ownerpublic + "\n" + 'ActivePublicKey: ' + this.state.txt_activepublic);
    EasyToast.show("复制成功")
  }

  deleteWallet() {
    EasyDialog.dismis();
    const view =
      <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
          selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass}
          placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent" />
      </View>
    EasyDialog.show("密码", view, "确定", "取消", () => {
      if (this.state.password == "") {
        EasyToast.show('请输入密码');
        return;
      }
      try {
        var data = this.props.navigation.state.params.data;
        var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
        var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
        if (plaintext_words.indexOf('eostoken') != - 1) {
          plaintext_words = plaintext_words.substr(8, plaintext_words.length);
          const { dispatch } = this.props;
          this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
          //删除tags
          JPushModule.deleteTags([data.name],map => {
            if (map.errorCode === 0) {
              console.log('Delete tags succeed, tags: ' + map.tags)
            } else {
              console.log(map)
              console.log('Delete tags failed, error code: ' + map.errorCode)
            }
          });
          DeviceEventEmitter.addListener('delete_wallet', (tab) => {
            this.props.navigation.goBack();
          });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  activeWallet(data) {
    if(data.name.length != 12){
      EasyToast.show('该账号格式无效，无法进行激活！');
    }else{
    EasyDialog.dismis();
    // if(Platform.OS == 'android' ){
      EasyLoading.show();
    // }

    this.props.dispatch({
      type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
        EasyLoading.dismis();
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              EasyDialog.show("EOS账号创建说明", (<View>
                <Text style={styles.inptpasstext}>免费激活账户需达到{this.state.integral}积分，请先登录EosToken；</Text>
                <Text style={styles.Becarefultext}>警告：未激活账户无法使用账户所有功能！</Text>
                </View>), "知道了", null,  () => { EasyDialog.dismis() });
              return;
            }
          });         
        }else if(data.code == 0) {
          this.setState({
              accumulative:this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout
          });
          if(this.state.accumulative >= this.state.integral){
            const view =
            <View style={styles.passoutsource}>
              <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass}
                placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent" />
            </View>
          EasyDialog.show("密码", view, "确定", "取消", () => {
            if (this.state.password == "") {
              EasyToast.show('请输入密码');
              return;
            }
            try {
              var data = this.props.navigation.state.params.data;
              var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
              var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
              var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
              if (plaintext_words.indexOf('eostoken') != - 1) {
                plaintext_words = plaintext_words.substr(8, plaintext_words.length);
                const { dispatch } = this.props;
                // this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
              let _wallet = this.props.navigation.state.params.data
                EasyLoading.show('正在请求');
                this.props.dispatch({
                  type: 'wallet/createAccountService', payload: { username: _wallet.account, owner: _wallet.ownerPublic, active: _wallet.activePublic, isact:true}, callback: (data) => {
                    EasyLoading.dismis();
                    if (data.code == '0') {
                      _wallet.isactived = true
                      this.props.dispatch({
                        type: 'wallet/saveWallet', wallet: _wallet, callback: (data, error) => {
                          DeviceEventEmitter.emit('updateDefaultWallet');
                          if (error != null) {
                            EasyToast.show('激活账号失败：' + error);
                            this.props.navigation.goBack();
                          } else {
                            EasyToast.show('激活账号成功');
                            this.props.navigation.goBack();
                          }
                        }
                      });
                    }else{
                      EasyToast.show('激活账号失败：' + data.msg);
                      this.props.navigation.goBack();
                    }
                  }
                })
              } else {
                EasyToast.show('您输入的密码不正确');
              }
            } catch (error) {
              EasyToast.show('您输入的密码不正确');
            }
            EasyDialog.dismis();
          }, () => { EasyDialog.dismis() });
          }else {
            EasyDialog.show("EOS账号创建说明", (<View>
              <Text style={styles.inptpasstext}>1.系统检测到您当前的积分不足，无法获得免费激活账户权益；</Text>
              <Text style={styles.inptpasstext}>2.当前创建账号需满{this.state.integral}积分，后期会按照市场价格调整；</Text>
              <Text style={styles.inptpasstext}>3.您可以联系官方小助手购买积分进行激活；</Text>
              <Text style={styles.Becarefultext}>警告：未激活账户无法使用账户所有功能！</Text>
              <View style={styles.linkout}>
                <Text style={styles.linktext} onPress={() => this.prot(this,'Explain')}>积分说明</Text>
                <Text style={styles.linktext} onPress={() => this.prot(this,'EOS-TOKEN')}>官方小助手</Text>
              </View>
              </View>), "知道了", null,  () => { EasyDialog.dismis() });
          } 
        }
      }, 
    });
  }
  }

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'Explain') {
      EasyDialog.dismis()
    navigate('Web', { title: "积分说明", url: "http://static.eostoken.im/html/20180703/1530587725565.html" });
    }else  if (key == 'EOS-TOKEN') {
      EasyDialog.dismis()
      navigate('AssistantQrcode', key);
    }
  }

  backupWords() {
    const view =
      <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
          selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass}
          placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent"/>
      </View>

    EasyDialog.show("密码", view, "备份", "取消", () => {

      if (this.state.password == "") {
        EasyToast.show('请输入密码');
        return;
      }

      try {
        var _words = this.props.navigation.state.params.data.words;
        var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

        var words_active = this.props.navigation.state.params.data.words_active;
        var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

        if (plaintext_words.indexOf('eostoken') != -1) {
          plaintext_words = plaintext_words.substr(9, plaintext_words.length);
          var wordsArr = plaintext_words.split(',');

          plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
          var wordsArr_active = plaintext_words_active.split(',');

          this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  toBackup = (words) => {
    this.props.navigation.goBack();
    const { navigate } = this.props.navigation;
    navigate('BackupWords', { words_owner: words.words_owner, words_active: words.words_active, wallet: this.props.navigation.state.params });
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }


  render() {
    const c = this.props.navigation.state.params.data
    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <View style={styles.walletout}>
            <View style={styles.accountout} >
              {/* <Text style={{ fontSize: 17, color: '#FFFFFF', marginBottom: 5, }}></Text> */}
              <Text style={styles.accounttext}> {this.props.navigation.state.params.data.account}</Text>
            </View>
            <View style={styles.topout}>
              <Text style={styles.outname}>账户名称：{c.name}</Text>
              {(!c.isactived && c.hasOwnProperty('isactived')) ? <Text style={styles.notactived}>未激活</Text>:(c.isBackups ? null : <Text style={styles.stopoutBackups}>未备份</Text>) }   
            </View>
          </View>
          
          <View style={{ marginBottom: 50 }}>
            {this._renderListItem()}
          </View>

          {/* <Button onPress={() => this.backupWords()} style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>备份助记词</Text>b
            </View>
          </Button> */}
          {(!this.props.navigation.state.params.data.isactived && this.props.navigation.state.params.data.hasOwnProperty('isactived')) ? 
          <Button onPress={this.activeWallet.bind(this, c)} style={{ flex: 1 }}>
            <View style={styles.acttiveout}>
              <Text style={styles.delete}>激活账户</Text>
            </View>
          </Button>
          :null
          }
          <Button onPress={() => this.deleteWallet()} style={{ flex: 1 }}>
            <View style={styles.deleteout}>
              <Text style={styles.delete}>删除账户</Text>
            </View>
          </Button>

        </View>
      </ScrollView>
      <View style={styles.pupuo}>
        <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
          <View style={styles.modalStyle}>
            <View style={styles.subView} >
              <Button style={{ alignItems: 'flex-end', }} onPress={this._setModalVisible.bind(this)}>
                <Text style={styles.closeText}>×</Text>
              </Button>
              <Text style={styles.titleText}>备份账户</Text>
              {/* <Text style={styles.noticeText}>安全警告：私钥未经加密，导出存在风险，建议使用助记词和Keystore进行备份。</Text> */}
              <View style={styles.contentText}>
                <Text style={styles.textContent}>OwnerPrivateKey: {this.state.txt_owner}</Text>
              </View>
              <View style={styles.contentText}>
                <Text style={styles.textContent}>ActivePrivateKey: {this.state.txt_active}</Text>
              </View>
              <Button onPress={() => { this.copy() }}>
                <View style={styles.buttonView}>
                  <Text style={styles.buttonText}>复制</Text>
                </View>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.pupuo}>
        <Modal animationType='slide' transparent={true} visible={this.state.showpublickey} onShow={() => { }} onRequestClose={() => { }} >
          <View style={styles.modalStyle}>
            <View style={styles.subView} >
              <Button style={{ alignItems: 'flex-end', }} onPress={this._setModalVisiblePublicKey.bind(this)}>
                <Text style={styles.closeText}>×</Text>
              </Button>
              <Text style={styles.titleText}>导出公钥</Text>
              <View style={styles.contentText}>
                <Text style={styles.textContent}>OwnerPublicKey: {this.state.txt_ownerpublic}</Text>
              </View>
              <View style={styles.contentText}>
                <Text style={styles.textContent}>ActivePublicKey: {this.state.txt_activepublic}</Text>
              </View>
              <Button onPress={() => { this.copyPublicKey() }}>
                <View style={styles.buttonView}>
                  <Text style={styles.buttonText}>复制</Text>
                </View>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
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
  linkout: {
    flexDirection: 'row',
    paddingTop: 20,
    justifyContent: 'flex-end'
  },
  linktext: {
    paddingLeft: 15,
    color: UColor.tintColor,
    fontSize: 14,
  },


  passoutsource: {
    flexDirection: 'column', 
    alignItems: 'center'
  },
  inptpass: {
    color: UColor.tintColor,
    width: maxWidth-100,
    height: 45,
    paddingBottom: 5,
    fontSize: 16,
    backgroundColor: UColor.fontColor,
    borderBottomColor: UColor.baseline,
    borderBottomWidth: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  walletout: { 
    padding: 20, 
    height: 120, 
    backgroundColor:  UColor.mainColor, 
    margin: 10, 
    borderRadius: 5, 
  },
  accountout: { 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  accounttext: { 
    fontSize: 17, 
    color:  UColor.arrow, 
    marginBottom: 10, 
  },



  topout: {
    flexDirection: "row",
    flex: 1,
  },
  outname: {
    fontSize: 14,
    color: UColor.fontColor,
    textAlign: 'left',
    marginRight: 10,
  },
  stopoutBackups: {
    height: 18,
    lineHeight: 15,
    fontSize: 10,
    color: '#2ACFFF',
    textAlign: 'left',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ACFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  notactived: {
    height: 18,
    lineHeight: 15,
    fontSize: 10,
    color: UColor.showy,
    textAlign: 'left',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UColor.showy,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
 

  walletname: { 
    fontSize: 15, 
    color:  UColor.arrow, 
  },
  acttiveout: {
    height: 45, 
    backgroundColor:  UColor.tintColor, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 20, 
    marginRight: 20, 
    borderRadius: 5,
    marginBottom: 30,
  },
  deleteout: {
    height: 45, 
    backgroundColor: UColor.showy, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 20, 
    marginRight: 20, 
    borderRadius: 5,
    marginBottom: 30,
  },
  delete: { 
    fontSize: 15, 
    color:  UColor.fontColor,
  },

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
  //警告提示  
  noticeText: {
    color: '#F45353',
    fontSize: 14,
    marginLeft: 15,
    marginRight: 15,
    textAlign: 'left',
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
    backgroundColor:  UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color:  UColor.fontColor,
  },

});

export default WalletDetail;
