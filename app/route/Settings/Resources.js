import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,ImageBackground} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
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
import ViewShot from "react-native-view-shot";
import { EasyLoading } from '../../components/Loading';

@connect(({wallet}) => ({...wallet}))
class Bvote extends React.Component {
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "资源管理",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
          },        
        };
      };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,showShare:false,news:{},
      cpu_staked: '0 EOS',
      cpu_available: '0',
      net_staked:'0 EOS',
      net_available:'0',
      ram_used:'0',
      ram_available:'0',
    };
  }

  componentDidMount() {
    EasyLoading.show();
    this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {
        this.getAccountInfo();
        EasyLoading.dismis();
    }}); 
  }

  getAccountInfo(){
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
        this.setState({
            cpu_staked:data.total_resources.cpu_weight,
            cpu_available:(data.cpu_limit.available / 1000).toFixed(3),
            net_staked:data.total_resources.net_weight,
            net_available:(data.net_limit.available / 1024).toFixed(3),
            ram_used:(data.ram_usage / 1024).toFixed(3),
            ram_available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(3),
        });
    } });
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
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
              <TouchableHighlight onPress={this.goPage.bind(this, 'Calculation')}> 
                <View style={styles.nov} >
                  <Image source={UImage.Calculation} style={styles.imgsize} />
                  <View  style={styles.outsource} >                               
                      <Text style={styles.headtextSize}>计算资源</Text>
                      <View style={{ flexDirection:'row', alignItems: "center",}}>
                          <Text style={styles.textSizeone}>可用：{this.state.cpu_available} ms</Text>
                          <Text style={styles.textSizetwo}>抵押：{this.state.cpu_staked}</Text>
                      </View>
                  </View>
                  <Ionicons style={styles.arrow} name="ios-arrow-forward-outline" size={16} color={UColor.fontColor} />
                </View> 
              </TouchableHighlight>  
              <TouchableHighlight onPress={this.goPage.bind(this, 'Network')}> 
                <View style={styles.nov} >
                  <Image source={UImage.network} style={styles.imgsize} />
                  <View  style={styles.outsource} >                               
                      <Text style={styles.headtextSize}>网络资源</Text>
                      <View style={{ flexDirection:'row', alignItems: "center",}}>
                          <Text style={styles.textSizeone}>可用：{this.state.net_available} KB</Text>
                          <Text style={styles.textSizetwo}>抵押：{this.state.net_staked}</Text>
                      </View>
                  </View>
                  <Ionicons style={styles.arrow} name="ios-arrow-forward-outline" size={16} color={UColor.fontColor} />
                </View>
              </TouchableHighlight>
              <TouchableHighlight onPress={this.goPage.bind(this, 'Memory')}> 
                <View style={styles.nov} >
                  <Image source={UImage.Memory} style={styles.imgsize} />
                  <View style={styles.outsource} >                               
                      <Text style={styles.headtextSize}>内存资源</Text>
                      <View style={styles.textoutsource}>
                          <Text style={styles.textSizeone}>可用：{this.state.ram_available} KB</Text>
                          <Text style={styles.textSizetwo}>已用：{this.state.ram_used} KB</Text>
                      </View>
                  </View>
                  <Ionicons style={styles.arrow} name="ios-arrow-forward-outline" size={16} color={UColor.fontColor} />
                </View> 
              </TouchableHighlight>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingHorizontal:6,
    },
    nov: {
      alignItems: 'center', 
      flexDirection:'row', 
      width: ScreenWidth-12, 
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
    outsource: {
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
    }
})
export default Bvote;