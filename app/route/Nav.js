import React from 'react';
import { StackNavigator, TabNavigator } from 'react-navigation';
import { CameraRoll, Image, View, BackHandler, Text, Platform, DeviceEventEmitter, BackAndroid, AppState, Linking, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { redirect } from '../utils/Api'
import UColor from '../utils/Colors'
import UImage from '../utils/Img'
import Home from './Home'
import Coins from './Coins'
import Community from './Settings/Community'
import News from './News'
import Settings from './Settings'
import Splash from './Splash'
import Web from '../route/Web'
import Coin from './Coins/Detail'
import Login from './Login'
import AssistantQrcode from './Login/AssistantQrcode'
import Forget from './Login/Forget'
import Helpcenter from './Login/Helpcenter'
import ProblemFeedback from './Login/ProblemFeedback'
import SignIn from './Login/SignIn'
import Add_assets from './Home/Add_assets'
import Coin_search from './Home/Coin_search'
import Info from './Home/Info'
import AssetInfo from './Home/AssetInfo'
import Thin from './Home/Thin'
import TradeDetails from './Home/TradeDetails'
import TurnIn from './Home/TurnIn'
import TurnOut from './Home/TurnOut'
import TurnOutAsset from './Home/TurnOutAsset'
import Share from './ShareInvite'
import CreateWallet from './Wallet/CreateWallet'
import BackupWords from './Wallet/BackupWords'
import BackupNote from './Wallet/BackupNote'
import InputWords from './Wallet/InputWords'
import ImportKey from './Wallet/ImportPrivateKey'
import ImportEosKey from './Wallet/ImportEosKey'
import WalletManage from './Wallet/WalletManage'
import WalletDetail from './Wallet/WalletDetail'
import ModifyPassword from './Wallet/ModifyPassword'
import ExportKeystore from './Wallet/ExportKeystore'
import ExportPrivateKey from './Wallet/ExportPrivateKey'
import BarCode from './Wallet/BarcodeTest'
// import AddressQr from './Wallet/AddressQr'
import { EasyToast } from "../components/Toast"
import { EasyDialog } from "../components/Dialog"
import { EasyAdress } from "../components/Address"
import Upgrade from 'react-native-upgrade-android';
import codePush from 'react-native-code-push'
var DeviceInfo = require('react-native-device-info');
import { connect } from 'react-redux'
import SplashScreen from 'react-native-splash-screen'
import AgentInfo from './Settings/AgentInfo'
import Imvote from './Settings/Imvote'
import Resources from './Settings/Resources'
import Set from './Settings/Set'
import Delegate from './Settings/Delegate'
import Nodevoting from './Settings/Nodevoting'
import Bvote from './Settings/Bvote'
import Calculation from './Settings/Calculation'
import Memory from './Settings/Memory'
import Network from './Settings/Network'
import Boot from './Boot'
import moment from 'moment';
import Button from '../components/Button'
import ViewShot from "react-native-view-shot";
import QRCode from 'react-native-qrcode-svg';
import Constants from '../utils/Constants'
import { EasyLoading } from '../components/Loading';
require('moment/locale/zh-cn');
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;

// import Eosjs from '../components/eosjs/Eosjs'
var WeChat = require('react-native-wechat');

const TabContainer = TabNavigator(
  {
    Home: { screen: Home },
    Coins: { screen: Coins },
    News: { screen: News },
    Settings: { screen: Settings }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName = focused ? UImage.tab_1_h : UImage.tab_1
            break;
          case 'Coins':
            iconName = focused ? UImage.tab_2_h : UImage.tab_2
            break;
          case 'News':
            iconName = focused ? UImage.tab_3_h : UImage.tab_3
            break;
          case 'Settings':
            iconName = focused ? UImage.tab_4_h : UImage.tab_4
        }
        return (<Image source={iconName} style={{ width: 20, height: 20, padding: 0 }} />);
      },
    }),
    initialRouteName: "Coins",
    lazy: true,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
      activeTintColor: UColor.tintColor,
      inactiveTintColor: "#6579a0",
      showIcon: true,
      showLabel: true,
      style: {
        height: 49,
        backgroundColor: UColor.secdColor,
        borderBottomWidth: 0,
      },
      labelStyle: {
        fontSize: 10,
        marginTop: 2
      },
      indicatorStyle: {
        opacity: 0
      },
      tabStyle: {
        padding: 0,
        margin: 0
      }
    }
  }
);

const Nav = StackNavigator(
  {
    Splash: {
      screen: Splash
    },
    Home: {
      screen: TabContainer,
      navigationOptions: {
        headerLeft: null,
        headerRight: null,
      }
    },
    Web: {
      screen: Web
    },
    Coin: {
      screen: Coin
    },
    Community: {
      screen: Community
    },
    CreateWallet: {
      screen: CreateWallet
    },
    Calculation: {
      screen: Calculation
    },
    BackupWords: {
      screen: BackupWords
    },
    BackupNote: {
      screen: BackupNote
    },
    ImportKey: {
      screen: ImportKey
    },
    ImportEosKey: {
      screen: ImportEosKey
    },
    WalletManage: {
      screen: WalletManage
    },
    WalletDetail: {
      screen: WalletDetail
    },
    InputWords: {
      screen: InputWords
    },
    ExportKeystore: {
      screen: ExportKeystore
    },
    ExportPrivateKey: {
      screen: ExportPrivateKey
    },
    ModifyPassword: {
      screen: ModifyPassword
    },
    Memory: {
      screen: Memory
    },
    Network: {
      screen: Network
    },
    BarCode: {
      screen : BarCode
    },
    // AddressQr: {
    //   screen : AddressQr
    // },
    Login: {
      screen: Login
    },
    SignIn: {
      screen: SignIn
    },
    AssistantQrcode: {
      screen: AssistantQrcode
    },
    Forget: {
      screen: Forget
    },
    Helpcenter: {
      screen: Helpcenter
    },
    ProblemFeedback: {
      screen: ProblemFeedback
    },
    Share: {
      screen: Share
    },
    Bvote: {
      screen: Bvote
    },
    Resources: {
      screen: Resources
    },
    Set: {
      screen: Set
    },
    Delegate: {
      screen: Delegate
    },
    AgentInfo: {
      screen: AgentInfo
    },
    Imvote: {
      screen: Imvote
    },
    Nodevoting: {
      screen: Nodevoting
    },
    Add_assets: {
      screen: Add_assets
    },
    Coin_search: {
      screen: Coin_search
    },
    Info: {
      screen: Info
    },
    AssetInfo: {
      screen: AssetInfo
    },
    Thin: {
      screen: Thin
    },
    TradeDetails: {
      screen: TradeDetails
    },
    TurnIn: {
      screen: TurnIn
    },
    TurnOut: {
      screen: TurnOut
    },
    TurnOutAsset: {
      screen: TurnOutAsset
    },
    Boot: {
      screen: Boot
    }
  },
  {
    navigationOptions: () => ({
      gesturesEnabled: true,
      headerTitleStyle: {
        fontWeight: 'normal',
        color: UColor.fontColor,
        fontSize: 18,
        alignSelf: 'center'
      },
      headerBackTitle: null,
      headerBackTitleStyle: {
        color: UColor.fontColor
      },
      headerTintColor: '#fff',
      headerStyle: {
        backgroundColor: UColor.secdColor,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        height: (Platform.OS == 'ios') ? 49 : 72,
        paddingTop: (Platform.OS == 'ios') ? 0 : 18
      },
      headerRight: (
        <View style={{ height: 44, width: 55, justifyContent: 'center', paddingRight: 15 }} />
      ),
      mode: 'card',
      headerMode: 'screen',
      cardStyle: { backgroundColor: "#fff" },
      transitionConfig: (() => ({
        screenInterpolator: CardStackStyleInterpolator.forHorizontal,
      })),
      onTransitionStart: (() => {
        console.log('页面跳转动画开始');
      }),
      onTransitionEnd: (() => {
        console.log('页面跳转动画结束');
      }),
    }),
  }
);

let routeLength = 0;

@connect(({ banner, newsType, common, login, wallet }) => ({ ...banner, ...newsType, ...common, ...login,  ...wallet }))
class Route extends React.Component {

  state = {
    news: {},
    turnintoaccount: '',
    turninamount: '',
    turninsymbol: '',
    showShare: false,
    showVoteShare:false,
    showTurninShare:false,
    transformY: new Animated.Value(200),
    transformY1: new Animated.Value(-1000),
    vtransformY: new Animated.Value(200),
    vtransformY1: new Animated.Value(-1000)
  }

  constructor(props) {
    super(props)
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  doUpgrade = (url, version) => {
    if (Platform.OS !== 'ios') {
      this.setState({ visable: false });
      Upgrade.startDownLoad(url, version, "eostoken");
    } else {
      Linking.openURL(url);
    }
  }

  componentWillMount() {

  }
 
  

  componentDidMount() {
    //调取是否有钱包账户
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
      this.props.dispatch({ type: 'wallet/walletList' });
    } });

    //回到app触发检测更新
    AppState.addEventListener("change", (newState) => {
      newState === "active" && codePush.sync({ installMode: codePush.InstallMode.ON_NEXT_RESUME });
    });
    //加载广告
    this.props.dispatch({ type: 'banner/list', payload: {} });
    //加载资讯类别
    this.props.dispatch({ type: 'newsType/list', payload: {} });
    //关闭欢迎页
    setTimeout(() => {
      SplashScreen.hide();
      //APK更新
      if (Platform.OS !== 'ios') {
        Upgrade.init();
        DeviceEventEmitter.addListener('progress', (e) => {
          if (e.code === '0000') { // 开始下载
            EasyDialog.startProgress();
          } else if (e.code === '0001') {
            EasyDialog.progress(e.fileSize, e.downSize);
          } else if (e.code === '0002') {
            EasyDialog.endProgress();
          }
        });
      }
      //升级
      var th = this;
      this.props.dispatch({
        type: 'common/upgrade', payload: { os: DeviceInfo.getSystemName() }, callback: (data) => {
          if (data.code == 0) {
            if (DeviceInfo.getVersion() != data.data.version) {
              if (data.data.must == 1) {
                EasyDialog.show("版本更新", data.data.intr, "升级", null, () => { this.doUpgrade(data.data.url, data.data.version) })
              } else {
                EasyDialog.show("版本更新", data.data.intr, "升级", "取消", () => { this.doUpgrade(data.data.url, data.data.version) })
              }
            }
          }
        }
      })
    }, 1000);

    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

    DeviceEventEmitter.addListener('share', (news) => {
      this.setState({ news, showShare: true });
      this.state.transformY = new Animated.Value(200);
      this.state.transformY1 = new Animated.Value(-1000);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.state.transformY,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
          Animated.timing(this.state.transformY1,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
        ]).start();
      }, 300);
    });
    DeviceEventEmitter.addListener('voteShare', (news) => {
      this.setState({showVoteShare: true });
      this.state.vtransformY = new Animated.Value(200);
      this.state.vtransformY1 = new Animated.Value(-1000);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.state.vtransformY,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
          Animated.timing(this.state.vtransformY1,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
        ]).start();
      }, 300);
    });
    DeviceEventEmitter.addListener('turninShare', (news) => {
      this.setState({showTurninShare: true });
      var result = JSON.parse(news);// 转成JSON对象
 
      if(result.toaccount){
        this.setState({turnintoaccount:result.toaccount});
      }
      if(result.amount){
        this.setState({turninamount:result.amount});
      }
      if(result.symbol){
        this.setState({turninsymbol:result.symbol});
      }

      this.state.vtransformY = new Animated.Value(200);
      this.state.vtransformY1 = new Animated.Value(-1000);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.state.vtransformY,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
          Animated.timing(this.state.vtransformY1,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
        ]).start();
      }, 300);
    });
  }

  shareAction = (e) => {
    var th = this;
    if (e == 1) {
      this.refs.viewShot.capture().then(uri => {
        CameraRoll.saveToCameraRoll(uri);
        EasyToast.show("图片已保存到您的相册,打开QQ并选择图片发送吧");
        setTimeout(() => {
          Linking.openURL('mqqwpa://');
          th.setState({ showShare: false });
        }, 2000);
      });
    } else if (e == 2) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToSession({ type: 'imageFile', imageUrl: uri })
                .catch((error) => {
                  EasyToast.show(error.message);
                });
            } else {
              EasyToast.show('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    } else if (e == 3) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToTimeline({ type: 'imageFile', imageUrl: uri })
                .catch((error) => {
                  EasyToast.show(error.message);
                });
            } else {
              EasyToast.show('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    }

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }

  onBackAndroid = () => {
    if (routeLength == 1) {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        return false;
      }
      this.lastBackPressed = Date.now();
      EasyToast.show('再按一次退出应用');
      return true;
    } else {
      return false;
    }
  };

  getBalance() { 
    if(this.props.coinList == null){
      return;
    }

    for(var i = 0; i < this.props.coinList.length; i++) {
      if (this.props.coinList[i] != null && this.props.coinList[i].name != null && (this.props.coinList[i].isactived || !this.props.coinList[i].hasOwnProperty('isactived'))) {

        this.props.dispatch({
          type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.coinList[i].name, symbol: 'EOS' }
        })
  
      }
    }

    // 其他资产
    if(this.props.myAssets == null){
      return;
    }
          
    this.props.dispatch({
      type: 'assets/getBalance', payload: {assets: this.props.myAssets, accountName: this.props.defaultWallet.name}
    });
  }

  switchRoute = (prevNav, nav, action) => {
    //切换到个人中心，更新用户信息
    if (action && action.routeName && action.routeName == "Settings") {
      if (this.props.loginUser) {
        this.props.dispatch({ type: "login/info", payload: { uid: this.props.loginUser.uid, token: this.props.token } });
      }
    }
    //切换到钱包判断是否创建钱包
    if (action && action.routeName && action.routeName == "Home") {
        if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
          if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))){
            EasyDialog.show("温馨提示", "系统检测到你还未创建钱包，是否创建或导入私钥", "是", "否", () => {
              this.createWallet();
              EasyDialog.dismis()
            }, () => { EasyDialog.dismis() });  
            return;
          }
          }
        });
      }

      this.timer = setInterval( ()  =>{
        this.getBalance()
      },30000)
    }else if (action && action.routeName && (action.routeName == "Coins" || action.routeName == "News" || action.routeName == "Settings")) {
      this.timer && clearTimeout(this.timer);
    }

    if (action && action.routeName) {
      DeviceEventEmitter.emit('changeTab', action.routeName);
    }
    routeLength = nav.routes.length;
  }
  createWallet() {
    DeviceEventEmitter.emit('createWallet');
  }

  render() {

    return (<View style={{ flex: 1 }}>
      <Nav ref="nav" onNavigationStateChange={(prevNav, nav, action) => { this.switchRoute(prevNav, nav, action) }} />
      {this.state.showShare ? (
        <View style={{ position: 'absolute', zIndex: 100000, top: 0, left: 0, width: ScreenWidth, height: ScreenHeight, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Animated.View style={{
            height: ScreenHeight - 180, transform: [
              { translateX: 0 },
              { translateY: this.state.transformY1 },
            ]
          }}>
            <ScrollView style={{ marginTop: 50 }}>
              <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                <ViewShot ref="viewShot" style={{ left: 20, width: ScreenWidth - 40 }} options={{ format: "jpg", quality: 0.9 }}>
                  <View style={{ backgroundColor: "#fff", width: '100%', height: '100%' }}>
                    <Image source={UImage.share_banner} resizeMode="cover" style={{ width: '100%', height: (ScreenWidth - 40) * 0.32 }} />
                    <View style={{ padding: 20 }}>
                      <Text style={{ color: '#000', fontSize: 24, marginTop: 5 }}>{this.state.news.title}</Text>
                      <Text style={{ color: '#000', fontSize: 15, marginTop: 15 }}>{this.state.news.content}......</Text>
                      <View style={{ flexDirection: "row", width: '100%', justifyContent: "space-between" }}>
                        <Text style={{ color: '#000', fontSize: 15, marginTop: 15, marginTop: 15 }}>来源:{this.state.news.source}</Text>
                        <Text style={{ color: '#000', fontSize: 15, marginTop: 15, marginTop: 15 }}>{moment(this.state.news.createdate).fromNow()}</Text>
                      </View>

                    </View>
                    <View style={{ backgroundColor: '#F2F2F2', width: '100%', paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                      <View style={{ width: ScreenWidth - 40 - (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>E-Token钱包</Text>
                        <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>专注于柚子生态</Text>
                        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', padding: 5, backgroundColor: '#306eb1', margin: 10 }}>识别二维码 查看完整的资讯</Text>
                      </View>
                      <View style={{ width: (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center' }}>
                        <QRCode size={(ScreenWidth - 40) * 0.319 - 20} value={Constants.rootaddr+redirect + (Constants.loginUser ? Constants.loginUser.uid : "nuid") + "/" + (Constants.token ? Constants.token.substr(0, 4) : "ntk") + "/" + this.state.news.id} />
                      </View>
                    </View>
                  </View>
                </ViewShot>
              </View>
            </ScrollView>
          </Animated.View>
          <View style={{ height: 170, marginTop: 10 }}>
            <Animated.View style={{
              height: 170, flex: 1, backgroundColor: '#e7e7e7', transform: [
                { translateX: 0 },
                { translateY: this.state.transformY },
              ]
            }}>

              <View style={{ height: 125 }}>
                <Text style={{ color: '#000', marginTop: 10, width: "100%", textAlign: "center" }}>分享到</Text>
                <View style={{ flexDirection: "row" }}>
                  <Button onPress={() => { this.shareAction(1) }} style={{ width: '33%', justifyContent: 'center' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_qq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>QQ</Text>
                    </View>
                  </Button>
                  <Button onPress={() => { this.shareAction(2) }} style={{ width: '33%', justifyContent: 'center' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_wx} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>微信</Text>
                    </View>
                  </Button>
                  <Button onPress={() => { this.shareAction(3) }} style={{ width: '33%' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_pyq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>朋友圈</Text>
                    </View>
                  </Button>
                </View>
              </View>
              <Button onPress={() => { this.setState({ showShare: false }) }}>
                <View style={{ height: 45, backgroundColor: "#fff", flexDirection: "row" }}>
                  <Text style={{ color: '#000', fontSize: 15, width: "100%", textAlign: "center", alignSelf: 'center' }}>取消</Text>
                </View>
              </Button>
            </Animated.View>
          </View>
        </View>
      ) : null
      }





      {this.state.showVoteShare ? (
                <View style={{ position: 'absolute', zIndex: 100000, top: 0, left: 0, width: ScreenWidth, height: ScreenHeight, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                  <Animated.View style={{
                    height: ScreenHeight - 180, transform: [
                      { translateX: 0 },
                      { translateY: this.state.vtransformY1 },
                    ]
                  }}>
                    <ScrollView style={{ marginTop: 50 }}>
                      <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                        <ViewShot ref="viewShot" style={{ left: 20, width: ScreenWidth - 40 }} options={{ format: "jpg", quality: 0.9 }}>
                          <View style={{ backgroundColor: "#fff", width: '100%', height: '100%' }}>
                          
                            <View style={{ padding: 10 }}>
                              <Image source={UImage.Invitation_vote} resizeMode="cover" style={{ width: '100%', height:ScreenWidth-70 }} />
                              <View style={{ width: (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center',paddingBottom:20, }}>
                                <QRCode size={100} style={{ width: 100, }} value={'http://eostoken.im/'} />
                              </View>

                            </View>
                            <View style={{ backgroundColor: '#F2F2F2', width: '100%', paddingVertical: 5, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center' }}>
                              <View style={{ width: ScreenWidth - 40 - (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center' }}>
                                <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>E-Token</Text>
                                <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>专注于柚子生态</Text>
                                <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', padding: 5, backgroundColor: '#306eb1', margin: 10 }}>更多精彩 下载APP</Text>
                              </View>                            
                            </View>
                          </View>
                        </ViewShot>
                      </View>
                    </ScrollView>
                  </Animated.View>
                  <View style={{ height: 170, marginTop: 10 }}>
                    <Animated.View style={{
                      height: 170, flex: 1, backgroundColor: '#e7e7e7', transform: [
                        { translateX: 0 },
                        { translateY: this.state.vtransformY },
                      ]
                    }}>

                      <View style={{ height: 125 }}>
                        <Text style={{ color: '#000', marginTop: 10, width: "100%", textAlign: "center" }}>分享到</Text>
                        <View style={{ flexDirection: "row" }}>
                          <Button style={{ width: '33%', justifyContent: 'center' }} onPress={() => { this.shareAction(1) }}>
                            <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                              <Image source={UImage.share_qq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                              <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>QQ</Text>
                            </View>
                          </Button>
                          <Button  style={{ width: '33%', justifyContent: 'center' }} onPress={() => { this.shareAction(2) }}>
                            <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                              <Image source={UImage.share_wx} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                              <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>微信</Text>
                            </View>
                          </Button>
                          <Button  style={{ width: '33%' }} onPress={() => { this.shareAction(3) }}>
                            <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                              <Image source={UImage.share_pyq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                              <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>朋友圈</Text>
                            </View>
                          </Button>
                        </View>
                      </View>
                      <Button onPress={() => { this.setState({ showVoteShare: false }) }}>
                        <View style={{ height: 45, backgroundColor: "#fff", flexDirection: "row" }}>
                          <Text style={{ color: '#000', fontSize: 15, width: "100%", textAlign: "center", alignSelf: 'center' }}>取消</Text>
                        </View>
                      </Button>
                    </Animated.View>
                  </View>
                </View>
              ) : null
              }    
             
        {this.state.showTurninShare ? (
          <View style={{ position: 'absolute', zIndex: 100000, top: 0, left: 0, width: ScreenWidth, height: ScreenHeight, backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Animated.View style={{
              height: ScreenHeight - 180, transform: [
                { translateX: 0 },
                { translateY: this.state.vtransformY1 },
              ]
            }}>
              <ScrollView style={{ marginTop: 50 }}>
                <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                  <ViewShot ref="viewShot" style={{ left: 20, width: ScreenWidth - 40 }} options={{ format: "jpg", quality: 0.9 }}>
                    <View style={{ backgroundColor: "#fff", width: '100%', height: '100%' }}>
                    
                      <View style={{ padding: 10, }}>
                        <Image source={UImage.turnin_head} resizeMode="stretch" style={{ width: '100%', height:50 }} />
                        <Text style={{fontSize: 30, color:"#000000", padding: 10, textAlign: 'center',}}>{this.state.turninamount} <Text style={{fontSize: 22, color: "#818181"}}>{this.state.turninsymbol}</Text></Text>
                        <View style={{ justifyContent: 'center', alignSelf: 'center',paddingTop:10, }}>
                          <QRCode size={150}  value={'{\"toaccount\":\"' + this.state.turnintoaccount + '\",\"amount\":\"' + this.state.turninamount + '\",\"symbol\":\"' + this.state.turninsymbol + '\"}'} />
                        </View>
                        <Text style={{ color: '#5D5D5D', fontSize: 15, textAlign: 'center', marginTop: 10 }}>扫码向他支付</Text>
                        <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'left', marginTop: 5, padding: 20,}}>账户:{this.state.turnintoaccount}</Text>
                      </View>
                    </View>
                  </ViewShot>
                </View>
              </ScrollView>
            </Animated.View>
            <View style={{ height: 170, marginTop: 10 }}>
              <Animated.View style={{
                height: 170, flex: 1, backgroundColor: '#e7e7e7', transform: [
                  { translateX: 0 },
                  { translateY: this.state.vtransformY },
                ]
              }}>

                <View style={{ height: 125 }}>
                  <Text style={{ color: '#000', marginTop: 10, width: "100%", textAlign: "center" }}>分享到</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Button style={{ width: '33%', justifyContent: 'center' }} onPress={() => { this.shareAction(1) }}>
                      <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                        <Image source={UImage.share_qq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                        <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>QQ</Text>
                      </View>
                    </Button>
                    <Button  style={{ width: '33%', justifyContent: 'center' }} onPress={() => { this.shareAction(2) }}>
                      <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                        <Image source={UImage.share_wx} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                        <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>微信</Text>
                      </View>
                    </Button>
                    <Button  style={{ width: '33%' }} onPress={() => { this.shareAction(3) }}>
                      <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                        <Image source={UImage.share_pyq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                        <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>朋友圈</Text>
                      </View>
                    </Button>
                  </View>
                </View>
                <Button onPress={() => { this.setState({ showTurninShare: false }) }}>
                  <View style={{ height: 45, backgroundColor: "#fff", flexDirection: "row" }}>
                    <Text style={{ color: '#000', fontSize: 15, width: "100%", textAlign: "center", alignSelf: 'center' }}>取消</Text>
                  </View>
                </Button>
              </Animated.View>
            </View>
          </View>
        ) : null
        }            
    </View>)
  }
}

export default Route;
