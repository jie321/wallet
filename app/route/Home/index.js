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

@connect(({ wallet }) => ({ ...wallet }))
class Home extends React.Component {

  static navigationOptions = {
    title: '钱包',
    header: null,
    headerStyle: {
      paddingTop:20,
      backgroundColor: "#586888",
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
    };
  }

  componentDidMount() {
    this.getBalance();
    //加载地址数据
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
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
    this.timer = setInterval( ()  =>{
      this.getBalance()
    },10000)
    this.listener = RCTDeviceEventEmitter.addListener('createWallet',(value)=>{  
      this.createWallet();  
    });  
  }


  componentWillUnmount(){
    this.timer && clearTimeout(this.timer);
    this.listener.remove();  
  }

  getBalance() { 
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            if (data.data == "") {
              this.setState({
                balance: '0.0000 EOS',
                account: this.props.defaultWallet.name
              })
            } else {
              account: this.props.defaultWallet.name,
                this.setState({ balance: data.data })
            }
          } else {
            EasyToast.show('获取余额失败：' + data.msg);
          }
        }
      })
    } else {
      this.setState({ balance: '0.0000 EOS', account: 'xxxx' })
      // this.props.defaultWallet.name = 'xxxx';
      //   EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
      //   this.createWallet();
      //   EasyDialog.dismis()
      // }, () => { EasyDialog.dismis() });
    }
  }


  onRequestClose() {
    this.setState({
      modal: false
    });
  }

  onPress(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Bvote') {
      if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
        EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          this.createWallet();
          EasyDialog.dismis()
        }, () => { EasyDialog.dismis() });  

        return;
      }

      navigate('Bvote', {data, balance: this.state.balance});
      // EasyDialog.show("温馨提示", "即将开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    } else{
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  scan() {
    AnalyticsUtil.onEvent('Scavenging_transfer');
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      const { navigate } = this.props.navigation;
      navigate('BarCode', {});
    } else {
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
    }
  }

  qr() {
    AnalyticsUtil.onEvent('Receipt_code');
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this._setModalVisible();
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
    if (this.props.defaultWallet != null && this.props.defaultWallet.account != null) {
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
    // navigate('CreateWallet', {});\
    navigate('ImportEosKey', {});
    this.setState({
      modal: false
    });
  }

  walletDetail() {
    // EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
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
    navigate('Info', { coinType, balance: this.state.balance, account: this.props.defaultWallet.name });
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          initialListSize={1}
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 280) {
              this.setState({
                status: 'rgba(0, 0, 0,0.3)'
              });
            } else {
              this.setState({
                status: 'rgba(255, 255, 255,0)'
              });
            }
          }
          }
          enableEmptySections={true}
          dataSource={this.state.dataSource.cloneWithRows((this.props.list == null ? [] : this.props.list))}
          renderHeader={() => (
            <View style={styles.header}>
                <View style={styles.topbtn}>
                  <Button onPress={() => this.scan()}>
                    <Image source={UImage.scan} style={styles.imgBtn} />
                  </Button>
                  <Text style={styles.top}>EOS资产</Text>
                  <Button onPress={() => this.setState({ modal: !this.state.modal })}>
                    <Image source={UImage.wallet} style={styles.imgBtn} />
                  </Button>
                </View>
                <ImageBackground style={{ justifyContent: "center" }} source={UImage.home_bg} resizeMode="cover">
                  <View style={{ height: 70, flexDirection: "row",backgroundColor:'#43536D', borderRadius: 5,  marginTop: 20,marginBottom: 20,marginRight: 10,marginLeft: 10,}}>
                    <Button onPress={() => this.qr()} style={{flex: 1, justifyContent: "center", alignItems: 'center',padding: 5,}}>
                      <View style={{flex:1, alignItems: 'center', justifyContent: "center",}}>
                        <Image source={UImage.qr} style={styles.imgBtn} />
                        <Text style={{color: '#8696B0',fontSize: 14,}}>收币</Text>
                      </View>
                    </Button>
                    <Button onPress={this.onPress.bind(this, 'add')} style={{flex: 1, justifyContent: "center", alignItems: 'center', padding: 5,}}>
                      <View style={{flex:1, alignItems: 'center', justifyContent: "center",}}>
                        <Image source={UImage.candy} style={styles.imgBtn} />
                        <Text style={{color: '#8696B0',fontSize: 14,}}>领取糖果</Text>
                      </View>
                    </Button>
                    <Button onPress={this.onPress.bind(this, 'Bvote')} style={{flex: 1, justifyContent: "center", alignItems: 'center', padding: 5,}}>
                      <View style={{flex:1, alignItems: 'center', justifyContent: "center",}}>
                        <Image source={UImage.vote_node} style={styles.imgBtn} />
                        <Text style={{color: '#8696B0',fontSize: 14,}}>节点投票</Text>
                      </View>                      
                    </Button>
                    
                    {/* <Button  onPress={this.onPress.bind('add', this)}  style={{flex: 1, justifyContent: "center", alignItems: 'center', padding: 5,}}>
                      <View style={{flex:1, alignItems: 'center', justifyContent: "center",}}>
                        <Image source={UImage.nash} style={styles.imgBtn} />
                        <Text style={{color: '#8696B0',fontSize: 14,}}>NASH映射</Text>
                      </View>
                    </Button> */}
                  </View>
              </ImageBackground>
              <View style={{height: 75, backgroundColor: UColor.mainColor, flexDirection: "row",justifyContent: "space-between",borderBottomColor: '#65CAFF', borderBottomWidth: 2,}}>
                  <View style={{flex: 1, flexDirection: "column", alignItems: 'flex-start', justifyContent: "center",}}>
                    <Text style={{ marginLeft: 10, fontSize: 16, color: UColor.fontColor }}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name} 总资产（￥）</Text>
                    <View style={{flexDirection: "row",alignItems: 'center', justifyContent: "center", }}>
                      <Text style={{ marginLeft: 10, fontSize: 20, color: UColor.fontColor }}>≈{this.state.balance}</Text>
                      {/* <Text style={{ marginLeft: 5, fontSize: 16, color: '#98DD3E',}}>今日+{this.state.balance}</Text> */}
                    </View>
                  </View>
                  <Button onPress={this.onPress.bind(this, 'add')} style={{ width:80, alignItems: 'center', justifyContent: "center",}}>  
                    <View style={{flex:1,  alignItems: 'center', justifyContent: "center",}}>             
                      <Image source={UImage.add} style={styles.imgBtn} />
                      <Text style={{color:UColor.fontColor ,fontSize: 14, textAlign:'center'}}>添加资产</Text>  
                    </View>               
                  </Button>
              </View>
             
              <Modal animationType={'none'} transparent={true} onRequestClose={() => { this.onRequestClose() }} visible={this.state.modal}>
                <TouchableOpacity onPress={() => this.setState({ modal: false })} style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.4)', }}>
                  <View style={{ width: ScreenWidth / 2, height: maxHeight, backgroundColor: '#4D607E', alignItems: 'center', paddingTop: 50, }}>
                    <ListView
                      initialListSize={5}
                      style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: '#4D607E', }}
                      renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
                      enableEmptySections={true}
                      dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                      renderRow={(rowData) => (
                        <Button onPress={this.changeWallet.bind(this, rowData)}>
                          <View style={styles.walletlist} backgroundColor={(this.props.defaultWallet == null || this.props.defaultWallet.name == rowData.account) ? '#586888' : '#4D607E'}>
                            <Text style={{ color: '#EFEFEF', lineHeight: 28, }}>{rowData.name}</Text>
                            <Text style={{ color: '#8594AB', lineHeight: 28, }} numberOfLines={1} ellipsizeMode='middle'>{rowData.account}</Text>
                          </View>
                        </Button>
                      )}
                    />
                    <View style={{ width: '100%', height: maxHeight / 2.5, flexDirection: "column", paddingLeft: 20, paddingTop: 15, alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: '#586888', }}>
                      <Button onPress={() => this.createWallet()} style={{ height: 40, }}>
                        <View style={{ flex: 1, flexDirection: "row", }}>
                          <Image source={UImage.wallet_1} style={{ width: 25, height: 25, }} />
                          <Text style={{ marginLeft: 20, fontSize: 15, color: '#8594AB', }}>创建钱包</Text>
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
                        <Text style={{ width: 30, height: 30, marginBottom: 0, color: '#CBCBCB', fontSize: 28, }}>×</Text>
                      </Button>
                      <Text style={styles.titleText}>收款码</Text>
                      <Text style={styles.contentText}>{((this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name)}</Text>
                      <Text style={{ color: '#F45353', fontSize: 12, textAlign: 'center', }}>提示：扫码同样可获取地址</Text>
                      <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: "row", }}>
                        <View style={{ flex: 1, }} />
                        <QRCode size={200} style={{ width: 200, }} value={'{\"contract\":\"eos\",\"toaccount\":\"' + ((this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name) + '\",\"symbol\":\"EOS\"}'} />
                        <View style={{ flex: 1, }} />
                      </View>
                      <Button onPress={() => { this.copy() }}>
                        <View style={{ margin: 10, height: 40, borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 16, color: '#fff' }}>复制地址</Text>
                        </View>
                      </Button>
                    </View>
                  </View>
                </Modal>
              </View>
                {/* <View>
                  {
                    this.props.totalOpt != undefined && <Echarts ba option={this.props.totalOpt} height={Platform.OS == 'ios' ? 200 : 215} width={ScreenWidth} />
                  }
                  {
                    this.props.total != undefined && (<View style={styles.totalbg}>
                      <Button>
                        <View style={{ width: 200, height: 200, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 14, color: '#fff' }}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name}</Text>
                          <Text style={{ fontSize: 21, color: '#fff', marginTop: 15, marginBottom: 15 }}>{this.state.balance}</Text>
                        </View>
                      </Button>
                    </View>)
                  }
                </View> */}

                {/* <View style={styles.botbtn}>
                  <Button onPress={() => this.qr()}>
                    <Image source={UImage.qr} style={styles.imgBtn} />
                  </Button>
                  <Button onPress={this.onPress.bind('add', this)}>
                    <Image source={UImage.add} style={styles.imgBtn} />
                  </Button>
                </View> */}
              {/* </View> */}
            </View>
          )}

          renderRow={(rowData) => (
            <View>
              <Button onPress={this.coinInfo.bind(this, rowData)}>
                <View style={styles.row}>
                  <View style={styles.left}>
                    <Image source={{ uri: rowData.img }} style={{ width: 25, height: 25 }} />
                    <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>{rowData.name}</Text>
                  </View>
                  <View style={styles.right}>
                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: 'center', }}>
                      <View>
                        <Text style={{ fontSize: 18, color: UColor.fontColor, textAlign: 'right' }}>{this.state.balance}</Text>
                        <Text style={{ fontSize: 12, color: "#8696B0", textAlign: 'right', marginTop: 3 }}>≈（￥）{rowData.value} </Text>
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },
  header: {
    // height: 300,
    // backgroundColor: "#586888",
  },
  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    borderTopColor: '#2D354F', 
    borderTopWidth: 1,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  right: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  top: {
    height: Platform.OS == 'ios' ? 65 : 50,
    lineHeight:50,
    textAlign: "center",
    fontSize: 18,
    color: UColor.fontColor,
    // paddingTop: Platform.OS == 'ios' ? 24 : 16
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
  topbtn: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    width: Dimensions.get('window').width,
    height: 65,
    paddingTop:Platform.OS == 'ios' ? 30 : 20,
    paddingLeft: 10,
    paddingRight: 10,
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // top: Platform.OS == 'ios' ? 30 : 20,
    // bottom: 0,
    // paddingHorizontal: 20,
    backgroundColor:'#586888',
   
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
  pupuo: {
    // flex:1,  
    backgroundColor: '#ECECF0',
  },
  // modal的样式  
  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',  
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  // modal上子View的样式  
  subView: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
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
  tab1: {
    flex: 1,
  },
  tab2: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default Home;
