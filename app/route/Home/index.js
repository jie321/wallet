import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter' 
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
var Dimensions = require('Dimensions')
var ScreenWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
import { EasyToast } from "../../components/Toast"
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";

@connect(({ wallet, assets }) => ({ ...wallet, ...assets }))
class Home extends React.Component {

  static navigationOptions = {
    title: '钱包',
    header: null,
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      status: 'rgba(255, 255, 255,0)',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      fadeAnim: new Animated.Value(15),  //设置初始值
      modal: false,
      balance: 0,
      account: 'xxxx',
      show: false,
      init: true,
      myAssets: []
    };
  }

  componentDidMount() {
    this.getBalance();

    //加载地址数据
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
    this.props.dispatch({ type: 'assets/myAssetInfo', payload: { page: 1}, callback: (data) => { 
      this.setState({myAssets: data});
    } });
    Animated.timing(
      this.state.fadeAnim,  //初始值
      {
        toValue: 22,            //结束值
        duration: 2000,        //动画时间
        easing: Easing.linear,
      },
    ).start();               //开始
    DeviceEventEmitter.addListener('wallet_info', (data) => {
      this.getBalance();
    });
    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      this.getBalance();
    });

    this.listener = RCTDeviceEventEmitter.addListener('createWallet',(value)=>{  
      this.createWallet();  
    });  
    DeviceEventEmitter.addListener('updateMyAssets', (data) => {
      for (var i = 0; i < this.state.myAssets.length; i++) {
        if (this.state.myAssets[i].asset.name == data.asset.name) {
            if(data.value){ // 添加资产,  但资产已存在
              // 添加资产
              var _asset = {
              asset: data.asset,
              value: data.value,
              balance: '0',
              }
              this.state.myAssets[this.state.myAssets.length] = _asset;
            }else{ // 删除资产
              this.state.myAssets.splice(i, 1);
            }
        }
      }
      // this.setState({myAssets: assets});
      this.getBalance();
    });

    DeviceEventEmitter.addListener('eos_balance', (data) => {
      this.setEosBalance(data);
    });

    DeviceEventEmitter.addListener('asset_balance', (data) => {
      this.setAssetBalance(data);
    });
  }

  componentWillUnmount(){
    // this.timer && clearTimeout(this.timer);
    this.listener.remove();  
  }

  setEosBalance(data){
    if (data.code == '0') {
      if (data.data == "") {
        this.setState({
          balance: '0.0000 ',
          account: this.props.defaultWallet.name
        })
      } else {
        account: this.props.defaultWallet.name,
          this.setState({ balance: data.data.replace("EOS", "") })
      }
    } else {
      EasyToast.show('获取余额失败：' + data.msg);
    }
  }

  setAssetBalance(asset){
    this.setState({myAssets: asset});
  }

  getBalance() { 
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && (this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
      if(this.state.init){
        this.setState({init: false});
        EasyLoading.show();
      }

      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
          this.setEosBalance(data);
          EasyLoading.dismis();
        }
      })
    } else {
      this.setState({ balance: '0.0000', account: 'xxxx' })
      // this.props.defaultWallet.name = 'xxxx';
      //   EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
      //   this.createWallet();
      //   EasyDialog.dismis()
      // }, () => { EasyDialog.dismis() });
    }

    // 其他资产
    if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
      return;
    }

    this.props.dispatch({
      type: 'assets/getBalance', payload: {assets: this.props.myAssets, accountName: this.props.defaultWallet.name}, callback: (data) => {
        this.setAssetBalance(data);
      }
    });
  }


  onRequestClose() {
    this.setState({
      modal: false
    });
  }

  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'qr') {
      AnalyticsUtil.onEvent('Receipt_code');

      if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && (this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
        this._setModalVisible();
      } else {
        EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyDialog.dismis()
        }, () => { EasyDialog.dismis() });
      }
    }else if (key == 'Bvote') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyDialog.dismis()
        }, () => { EasyDialog.dismis() });  
        return;
      }
      navigate('Bvote', {data, balance: this.state.balance});
    }else if (key == 'sweet') {
      navigate('Web', { title: "糖果信息总汇", url: "https://www.eosdrops.io/" });
    }else if (key == 'Resources') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyDialog.dismis()
        }, () => { EasyDialog.dismis() });  
        return;
      }
      navigate('Resources', {});
    }else if(key == 'add'){
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
        EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyDialog.dismis()
        }, () => { EasyDialog.dismis() });  
        return;
      }
      navigate('Add_assets', {});
    } else{
      EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  scan() {
    AnalyticsUtil.onEvent('Scavenging_transfer');
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null && (this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
      const { navigate } = this.props.navigation;
      navigate('BarCode', {});
    } else {
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
    }
  }

  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  copy = () => {
    let address;
    if (this.props.defaultWallet != null && this.props.defaultWallet.account != null && (this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived'))) {
      address = this.props.defaultWallet.account;
    } else {
      address = this.state.account;
    }
    this._setModalVisible();
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    // navigate('CreateWallet', {});
    navigate('WalletManage', {});
    // navigate('ImportEosKey', {});
    this.setState({
      modal: false
    });
  }

  walletDetail() {
    // EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    const { navigate } = this.props.navigation;
    navigate('WalletManage', {});
  }

  changeWallet(data) {
    this.setState({
      modal: false
    });
    const { dispatch } = this.props;
    this.props.dispatch({ type: 'wallet/changeWallet', payload: { data } });
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
  }

  coinInfo(coinType) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) {
      //todo 创建钱包引导
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Info', { coinType, balance: this.state.balance, account: this.props.defaultWallet.name });
  }

  assetInfo(asset) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
      return;
    }

    const { navigate } = this.props.navigation;
    navigate('AssetInfo', { asset, account: this.props.defaultWallet.name });
  }

  render() {
    return (
      <View style={styles.container}>
             <View>
                <View style={styles.topbtn}>
                  <Button onPress={() => this.scan()}>
                    <Image source={UImage.scan} style={styles.imgBtn} />
                  </Button>
                  <Text style={styles.toptext}>EOS资产</Text>
                  <Button onPress={() => this.setState({ modal: !this.state.modal })}>
                    <Image source={UImage.wallet} style={styles.imgBtn} />
                  </Button>
                </View>
                <ImageBackground style={styles.bgout} source={UImage.home_bg} resizeMode="cover">
                  <View style={styles.head}>
                    <Button onPress={this.onPress.bind(this, 'qr')} style={styles.headbtn}>
                      <View style={styles.headbtnout}>
                        <Image source={UImage.qr} style={styles.imgBtn} />
                        <Text style={styles.headbtntext}>收币</Text>
                      </View>
                    </Button>
                    <Button onPress={this.onPress.bind(this, 'sweet')} style={styles.headbtn}>
                      <View style={styles.headbtnout}>
                        <Image source={UImage.candy} style={styles.imgBtn} />
                        <Text style={styles.headbtntext}>领取糖果</Text>
                      </View>
                    </Button>
                    <Button onPress={this.onPress.bind(this, 'Bvote')} style={styles.headbtn}>
                      <View style={styles.headbtnout}>
                        <Image source={UImage.vote_node} style={styles.imgBtn} />
                        <Text style={styles.headbtntext}>节点投票</Text>
                      </View>                      
                    </Button>
                    
                    <Button  onPress={this.onPress.bind(this, 'Resources')}  style={styles.headbtn}>
                      <View style={styles.headbtnout}>
                        <Image source={UImage.resources} style={styles.imgBtn} />
                        <Text style={styles.headbtntext}>资源管理</Text>
                      </View>
                    </Button>
                  </View>
              </ImageBackground>
              <View style={styles.addto}>
                  <View style={styles.addout}>
                    <Text style={styles.addtotext}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) ? this.state.account : this.props.defaultWallet.name} 总资产（EOS）</Text>
                    <View style={styles.addtoout}>
                      <Text style={styles.addtoouttext}>={this.state.balance}</Text>
                      {/* <Text style={{ marginLeft: 5, fontSize: 16, color: '#98DD3E',}}>今日+{this.state.balance}</Text> */}
                    </View>
                  </View>
                  <Button onPress={this.onPress.bind(this, 'add')} style={styles.addtobtn}>  
                    <View style={styles.addbtnout}>             
                      <Image source={UImage.add} style={styles.imgBtn} />
                      <Text style={styles.addbtnimg}>添加资产</Text>  
                    </View>               
                  </Button>
              </View>
          </View>   
        <View style={{height: 75}}>
          <ListView  initialListSize={1} enableEmptySections={true}
            dataSource={this.state.dataSource.cloneWithRows((this.props.list == null ? [] : this.props.list))}
            renderRow={(rowData, sectionID, rowID ) => (
              <View style={{height: 90,}}>
                <Button onPress={this.coinInfo.bind(this, rowData)}>
                  <View style={styles.row}>
                    <View style={styles.left}>
                      <Image source={{ uri: rowData.img }} style={styles.leftimg} />
                      <Text style={styles.lefttext}>{rowData.name}</Text>
                    </View>
                    <View style={styles.right}>
                      <View style={styles.rightout}>
                        <View>
                          <Text style={styles.rightbalance}>{this.state.balance}</Text>
                          <Text style={styles.rightmarket}>≈（￥）{(this.state.balance*rowData.value).toFixed(2)} </Text>
                        </View>
                        {/* <View style={{ marginLeft: 15, overflow: 'hidden' }}>
                          <Echarts style={{ overflow: 'hidden' }} option={rowData.opt} height={40} width={40} />
                        </View> */}
                      </View>
                    </View>
                  </View>
                </Button>
              </View>
            )}
          />   
        </View>
        <ListView initialListSize={1} enableEmptySections={true} 
          dataSource={this.state.dataSource.cloneWithRows(this.state.myAssets == null ? [] : this.state.myAssets)} 
          renderRow={(rowData, sectionID, rowID) => (      
            <View style={styles.listItem}>
              <Button onPress={this.assetInfo.bind(this, rowData)}>
                <View style={styles.row}>
                  <View style={styles.left}>
                    <Image source={rowData.asset.icon==null ? UImage.eos : { uri: rowData.asset.icon }} style={styles.leftimg} />
                    <Text style={styles.lefttext}>{rowData.asset.name}</Text>
                  </View>
                  <View style={styles.right}>
                    <View style={styles.rightout}>
                      <View>
                        <Text style={styles.rightbalance}>{rowData.balance==""? "0.0000" : rowData.balance.replace(rowData.asset.name, "")}</Text>
                        <Text style={styles.rightmarket}>≈（￥）0 </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Button>
            </View>
          )}                
         />  
       <Modal animationType={'none'} transparent={true} onRequestClose={() => { this.onRequestClose() }} visible={this.state.modal}>
          <TouchableOpacity onPress={() => this.setState({ modal: false })} style={styles.touchable}>
            <View style={styles.touchableout}>
              <ListView initialListSize={5} style={styles.touchablelist}
                renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
                enableEmptySections={true} dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                renderRow={(rowData) => (
                  (rowData.isactived || !rowData.hasOwnProperty('isactived')) ?
                  <Button onPress={this.changeWallet.bind(this, rowData)}>
                    <View style={styles.walletlist} backgroundColor={(this.props.defaultWallet == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived')) || this.props.defaultWallet.name == rowData.account) ? '#586888' : '#4D607E'}>
                      <Text style={styles.walletname}>{rowData.name}</Text>
                      <Text style={styles.walletaccount} numberOfLines={1} ellipsizeMode='middle'>{rowData.account}</Text>
                    </View>
                  </Button> : null
                )}
              />
              <View style={styles.ebhbtnout}>
                <Button onPress={() => this.createWallet()} style={{height: 40,}}>
                  <View style={styles.establishout}>
                    <Image source={UImage.wallet_1} style={styles.establishimg} />
                    <Text style={styles.establishtext}>创建钱包</Text>
                  </View>
                </Button>
                {/* <Button onPress={() => this.walletTest()} style={{ height: 40, }}>
                  <View style={{ flex: 1, flexDirection: "row", }}>
                    <Image source={UImage.wallet_1} style={{ width: 25, height: 25, }} />
                    <Text style={{ marginLeft: 20, fontSize: 15, color: '#8594AB', }}>钱包测试</Text>
                  </View>
                </Button> */}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.pupuo}>
          <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
            <View style={styles.modalStyle}>
              <View style={styles.subView} >
                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                  <Text style={styles.butclose}>×</Text>
                </Button>
                <Text style={styles.titleText}>收款码</Text>
                <Text style={styles.contentText}>{((this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) ? this.state.account : this.props.defaultWallet.name)}</Text>
                <Text style={styles.prompt}>提示：扫码同样可获取账户</Text>
                <View style={styles.codeout}>
                  <View style={styles.tab} />
                  <QRCode size={200} value={'{\"contract\":\"eos\",\"toaccount\":\"' + ((this.props.defaultWallet == null || this.props.defaultWallet.name == null || (!this.props.defaultWallet.isactived && this.props.defaultWallet.hasOwnProperty('isactived'))) ? this.state.account : this.props.defaultWallet.name) + '\",\"symbol\":\"EOS\"}'} />
                  <View style={styles.tab} />
                </View>
                <Button onPress={() => { this.copy() }}>
                  <View style={styles.copyout}>
                    <Text style={styles.copytext}>复制账户</Text>
                  </View>
                </Button>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },

  row: {
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: UColor.secdColor
  },

  topbtn: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    width: Dimensions.get('window').width,
    paddingTop:Platform.OS == 'ios' ? 30 : 20,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: UColor.mainColor, 
  },
  toptext: {
    height: Platform.OS == 'ios' ? 65 : 50,
    lineHeight: Platform.OS == 'ios' ? 65 : 50,
    textAlign: "center",
    fontSize: 18,
    color: UColor.fontColor,
  },

  bgout: {
    justifyContent: "center" 
  },
  head: {
    height: 70, 
    flexDirection: "row",
    backgroundColor: UColor.secdColor, 
    borderRadius: 5,  
    marginTop: 20,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  headbtn: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: 'center',
    padding: 5,
  },
  headbtnout: {
    flex:1, 
    alignItems: 'center', 
    justifyContent: "center",
  },
  headbtntext: {
    color: UColor.arrow,
    fontSize: 14,
  },

  addto: {
    height: 75, 
    backgroundColor: UColor.mainColor, 
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: UColor.tintColor, 
    borderBottomWidth: 2,
  },
  addout: {
    flex: 1, 
    flexDirection: "column", 
    alignItems: 'flex-start', 
    justifyContent: "center",
  },
  addtotext: {
    marginLeft: 10, 
    fontSize: 16, 
    color: UColor.fontColor
  },
  addtoout: {
    flexDirection: "row",
    alignItems: 'center', 
    justifyContent: "center", 
  },
  addtoouttext: {
    marginLeft: 10, 
    fontSize: 20, 
    color: UColor.fontColor 
  },
  addtobtn: {
    width:80, 
    alignItems: 'center', 
    justifyContent: "center",
  },
  addbtnout: {
    flex:1,  
    alignItems: 'center', 
    justifyContent: "center",
  },
  addbtnimg: {
    color:UColor.fontColor ,
    fontSize: 14, 
    textAlign:'center'
  },


  touchable: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    backgroundColor: UColor.mask,
  },
  touchableout: {
    width: ScreenWidth / 2, 
    height: maxHeight, 
    backgroundColor: '#4D607E', 
    alignItems: 'center', 
    paddingTop: 50,
  },
  touchablelist: {
    width: '100%', 
    borderBottomWidth: 1, 
    borderBottomColor: '#4D607E', 
  },


  totalbg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: '100%',
    width: "100%",
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999
  },
  homebg: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
 
  botbtn: {
    width: Dimensions.get('window').width,
    height: 50,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 250,
    bottom: 0,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  imgBtn: {
    width: 30,
    height: 30,
    margin:5,
  },
  item: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  walletlist: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 10,
    height: 67,
  },
  walletname: {
    color: '#EFEFEF', 
    lineHeight: 28,
  },
  walletaccount: {
    color: '#8594AB', 
    lineHeight: 28,
  },


 ebhbtnout: {
  width: '100%', 
  height: maxHeight / 2.5, 
  flexDirection: "column", 
  paddingLeft: 20, 
  paddingTop: 15, 
  alignItems: 'flex-start', 
  borderTopWidth: 1, 
  borderTopColor: UColor.mainColor, 
 },
 ebhbtn: {
  height: 40,
 },
  
  establishout: {
    flex: 1, 
    flexDirection: "row",
    alignItems: 'center', 
  },
  establishimg:{
    width: 25, 
    height: 25, 
  },
  establishtext: {
    marginLeft: 20, 
    fontSize: 15, 
    color: '#8594AB',
  },



  pupuo: {
    // flex:1,  
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
    backgroundColor: UColor.fontColor,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: UColor.mask,
  },
  // 标题  
  titleText: {
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 内容  
  contentText: {
    fontSize: 15,
    textAlign: 'center',
  },
  // 按钮  
  buttonView: {
    alignItems: 'flex-end',
  },
  butclose: {
    width: 30,
    height: 30,
    marginBottom: 0,
    color: '#CBCBCB',
    fontSize: 28,
  },
  prompt: {
    color: '#F45353',
    fontSize: 12,
    textAlign: 'center',
  },
  codeout: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  copyout: {
    margin: 10, 
    height: 40, 
    borderRadius: 6, 
    backgroundColor: UColor.tintColor, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  copytext: {
    fontSize: 16, 
    color: UColor.fontColor,
  },

  tab: {
    flex: 1,
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  leftimg: {
    width: 25, 
    height: 25
  },
  lefttext: {
    marginLeft: 20,
    fontSize: 18,
    color: UColor.fontColor
  },
  right: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  rightout: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: 'center',
  },
  rightbalance: {
    fontSize: 18, 
    color: UColor.fontColor, 
    textAlign: 'right'
  },
  rightmarket: {
    fontSize: 12,
    color:  UColor.arrow,
    textAlign: 'right',
    marginTop: 3
  },
});

export default Home;
