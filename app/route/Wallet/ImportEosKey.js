import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, View, RefreshControl, Text, Platform, TextInput, ScrollView, TouchableHighlight, Animated,  Easing,  } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import { formatterNumber, formatterUnit } from '../../utils/FormatUtil'
import JPush from '../../utils/JPush'
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import UImage from '../../utils/Img';

const pages = [];

let loadMoreTime = 0;

let currentLoadMoreTypeId;

let timer;

let currentTab = 0;

const _index = 0;

@connect(({ wallet }) => ({ ...wallet }))
class ImportEosKey extends React.Component {

  static navigationOptions = {
    title: '导入EOS私钥'
  };

  constructor(props) {
    super(props);
    this.state = {
      bounceValue: new Animated.Value(1), 
      rotateValue: new Animated.Value(0),
      index: 0,
      reWalletpwd: '',
      walletpwd: '',
      ownerPk: '',
      activePk: '',
      words_owner: '',
      words_active: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [
        // { key: '0', title: '助记词' },
        { key: '2', title: '私钥' },
      ],
      isChecked: this.props.isChecked || false
    };
  }
  //组件加载完成
  componentDidMount() {
   
    const { dispatch } = this.props;

    //推送初始化
    const { navigate } = this.props.navigation;
    JPush.init(navigate);
  }


  startAnimation() {
    this.state.bounceValue.setValue(1);
    this.state.rotateValue.setValue(0);
        Animated.timing(this.state.rotateValue, {
            toValue: 1,  //角度从0变1
            duration: 800,  //从0到1的时间
            easing: Easing.linear,//线性变化，匀速旋转
        }).start();
  }

  refresh () {
    this.startAnimation(); 
  }


  componentWillUnmount() {
    // if (timer) {
    //   clearInterval(timer);
    // }
    DeviceEventEmitter.removeListener('changeTab');
  }

  // startTick(index) {
  //   const { dispatch } = this.props;
  //   InteractionManager.runAfterInteractions(() => {
  //     clearInterval(timer);
  //     timer = setInterval(function () {
  //       dispatch({ type: 'sticker/list', payload: { type: index } });
  //     }, 7000);
  //   });
  // }

  // onRefresh(key) {
  //   this.startTick(this.getRouteIndex(key));
  // }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.state.routes.length; i++) {
      if (this.state.routes[i].key == typeId) {
        return i;
      }
    }
  }

  //点击
  onPress = (coins) => {
    // const { navigate } = this.props.navigation;
    // navigate('Coin', { coins });
  };

  //切换tab
  _handleIndexChange = index => {
    // this.startTick(index);
    this.setState({ index });
    _index = index;
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({ index });
  };
  

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'clause') {
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'Memorizingwords') {
    navigate('Web', { title: "什么是助记词", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'privatekey') {
    navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/reg.html" });
    }
  }


  checkClick() {
    this.setState({
        isChecked: !this.state.isChecked
    });
 }


 importPriKey() {
  if (this.state.activePk == '') {
    EasyToast.show('请输入active私钥');
    return;
  }
  if (this.state.password == '') {
    EasyToast.show('请输入密码');
    return;
  }
  if (this.state.reWalletpwd == '') {
    EasyToast.show('请输入确认密码');
    return;
  }
  if (this.state.isChecked == false) {
    EasyToast.show('请确认已阅读并同意条款');
    return;
  }
  this.createWalletByPrivateKey(this.state.activePk, this.state.activePk);
}

createWalletByPrivateKey(owner_privateKey, active_privatekey){
  Eos.privateToPublic(active_privatekey,(r) => {
    var active_publicKey = r.data.publicKey;
    // Eos.privateToPublic(owner_privateKey, (r) => {
      try {
        var owner_publicKey = r.data.publicKey;
        // 根据puk到eos主网上获取相关账户名称
        this.props.dispatch({
          type: 'wallet/getAccountsByPuk',
          payload: {public_key: owner_publicKey}, callback: (data) => {
            if (data.code != '0') {
              alert('找不到' + owner_publicKey + "对应的账户名" + " "+JSON.stringify(data));
              return;
            }
  
            var result = {
              data:{
                ownerPublic:'',
                activePublic:'',
                ownerPrivate:'',
                activePrivate:'',
                words_active:'',
                words:''
              }
            };
            result.data.ownerPublic = owner_publicKey;
            result.data.activePublic = active_publicKey;
            result.data.words = '';
            result.data.words_active = '';
            result.data.ownerPrivate = owner_privateKey;
            result.data.activePrivate = active_privatekey;
            result.password = this.state.walletpwd;
            result.name = data.data.account_names[0];
            result.account = data.data.account_names[0];
            // 保存钱包信息
            this.props.dispatch({
              type: 'wallet/saveWallet', wallet: result, callback: (data) => {
                  
                if (data.error != null) {
                  EasyToast.show('导入私钥失败：' + data.error);
                } else {
                  EasyToast.show('导入私钥成功！');
                  DeviceEventEmitter.emit('updateDefaultWallet');
                  this.props.navigation.goBack();
                  
                }
              }
            });
          }
        });

        // 
      } catch (e) {
        alert('privateToPublic err: ' + JSON.stringify(e));
      }
    // });

  });
}


  render() {
    return (
      <View style={styles.container}>
          <View style={{ backgroundColor: '#43536D',}}>
            <View style={{ backgroundColor: '#4F617D',paddingLeft: 25, paddingRight: 25, paddingTop: 15, paddingBottom: 20, marginBottom: 5,}}>
                <Text style={{ color: '#8696B0', fontSize: 15, lineHeight: 25,}}>直接复制粘贴钱包私钥文件内容至输入框。或者直接输入私钥</Text>
            </View>     
            <View style={{ backgroundColor: '#586888',}}>
              <View style={{paddingLeft: 14,  paddingRight: 15, height: 75, backgroundColor: '#586888', borderBottomWidth: 0.5, borderBottomColor: '#43536D',}} >
                <Text style={{ color: '#8696B0', fontSize: 15, lineHeight: 30, paddingLeft: 5, }}>私钥</Text>
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                  value={this.state.activePk}
                  onChangeText={(activePk) => this.setState({ activePk })}
                  returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 16,  }}
                  placeholderTextColor="#8696B0" placeholder="粘贴或输入私钥" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                />
              </View>
              {/* <View style={{ paddingLeft: 14,  paddingRight: 15, height: 75, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}}>
                <Text style={{ color: '#8696B0', fontSize: 15, lineHeight: 30, paddingLeft: 5, }}>账号名称</Text>
                <View style={{flexDirection: 'row',}}>
                    <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                    onChangeText={(walletName) => this.setState({ walletName })}
                    returnKeyType="go" selectionColor="#65CAFF" style={{flex: 1, color: '#8696B0', fontSize: 16, }} placeholderTextColor="#8696B0"
                    value={this.state.walletName}
                    placeholder="输入账号或者点击刷新按钮" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                    />
                    <Button onPress={() => this.refresh()}>
                      <Animated.Image source={UImage.refresh} style={{width:30,height: 30, 
                                  transform: [{scale: this.state.bounceValue},
                                  {rotateZ: this.state.rotateValue.interpolate({ inputRange: [0,1], outputRange: ['0deg', '360deg'],})},
                          ]}}>
                      </Animated.Image>
                    </Button>   
                </View>
              </View> */}
            
              <View style={{paddingLeft: 14,  paddingRight: 15, height: 75,  backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}}>
                <View style={{flexDirection: 'row',}}>
                   <Text style={{flex: 1, color: '#8696B0', fontSize: 15, lineHeight: 30, paddingLeft: 5, }}>设置密码</Text>
                   {/* <View style={{flexDirection: 'row',}}>
                       <Text style={{color: '#8696B0', fontSize: 15, padding: 5,}}>弱</Text>
                       <Text style={{color: '#8696B0', fontSize: 15, padding: 5,}}>中</Text>
                       <Text style={{color: '#8696B0', fontSize: 15, padding: 5,}}>强</Text>
                   </View> */}
                </View>
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.password}
                  onChangeText={(password) => this.setState({ password })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 16, }} placeholderTextColor="#8696B0"
                  placeholder="输入密码至少8位,建议大小字母与数字混合" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                />
              </View>
              <View style={{paddingLeft: 14,  paddingRight: 15, height: 75,  backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}} >
                <Text style={{ color: '#8696B0', fontSize: 15, lineHeight: 30, paddingLeft: 5, }}>确认密码</Text>
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.reWalletpwd}
                  onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 16, }} placeholderTextColor="#8696B0"
                  placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row',justifyContent: 'center', alignItems: 'center', marginTop: 20,}}>
                <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                    <Image source={this.state.isChecked?UImage.aab1:UImage.aab2} style={{width:20,height:20,}}/>
                </TouchableHighlight>
              <Text style={styles.welcome} style={{ fontSize: 15, color: '#8696B0', marginLeft: 10 }}>我已经仔细阅读并同意</Text>
              <Text onPress={() => this.prot(this,'clause')} style={{ fontSize: 15, color: '#65CAFF', marginLeft: 5 }}>服务及隐私条款</Text>
            </View> 
            <Button onPress={() => this.importPriKey()}>
              <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 20, marginRight: 20, borderRadius: 5 }}>
                <Text style={{ fontSize: 15, color: '#fff' }}>开始导入</Text>
              </View>
            </Button>
            <Button onPress={() => this.prot(this,'privatekey')}>
              <View style={{ height: 45, backgroundColor: '#43536D', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                <Text style={{ fontSize: 15, color: '#65CAFF' }}>什么是 私钥 ？</Text>
              </View>
            </Button>
          </View>
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor
  },
  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'red'
  },
  right: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'black'
  },
  incup: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#F25C49',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  },
  incdo: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#25B36B',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  }
});

export default ImportEosKey;
