import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import QRCode from 'react-native-qrcode-svg';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
let {width, height} = Dimensions.get('window');

var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
class TradeDetails extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: '转账详情',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
            },
        };
    };

  constructor(props) {
    super(props);
    this.state = {
        delegatebw: "",
        feedBackText: "",
        selection: {start: 0, end: 0},
    };
  }

  componentDidMount() {
        // alert('trade: '+JSON.stringify(this.props.navigation.state.params.trade));
  }
  
  
  render() {
    const c = this.props.navigation.state.params.trade;
    return <View style={styles.container}>
        <View style={{height: 100, alignItems: 'center', justifyContent: 'center',  borderBottomColor: UColor.mainColor, borderBottomWidth: 0.5, }}>
            <View style={{flex: 1, flexDirection:'row', alignItems: 'center', justifyContent: 'center',}}>
                <Text style={{ fontSize: 30, color: '#FFFFFF'}}>{c.quantity.replace(" EOS", " ")}</Text>
                <Text style={{ fontSize: 15, color: '#FFFFFF',paddingTop: 10,}}> bytes</Text>
            </View>
            <Text style={{height: 35,fontSize: 14, color:UColor.tintColor,}}>（{c.description}）</Text>
        </View>
        <View style={{paddingHorizontal:20, paddingVertical: 5, borderBottomColor: UColor.mainColor, borderBottomWidth: 0.5,}}>
            <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10,}}>发送方：{c.from}</Text>
            <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10,}}>接受方：{c.to}</Text>
            <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10,}}>区块高度：{c.blockNum}</Text>
            <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10,}}>备注：{c.memo}</Text>
        </View>
        <Text style={{fontSize: 14, color: '#FFFFFF', textAlign: 'right', lineHeight: 30, marginRight: 10,}}>{c.blockTime}</Text>
        <View style={styles.codeout}>
            <QRCode size={140} style={{padding:3}} value={'https://eosmonitor.io/txn/' + c.transactionId } />
        </View>
        <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10, paddingHorizontal: 25, }} >交易号：{c.transactionId.substring(0, 15) +"..."+ c.transactionId.substr(c.transactionId.length-15) }</Text>
        <Text style={{fontSize: 14, color: '#8696B0', paddingTop: 10, paddingHorizontal: 25, }}>提示：扫码可获取区块交易状态</Text>
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
  inpt: {
    flex: 1, 
    color: '#8696B0', 
    fontSize: 14,
    textAlignVertical: 'top', 
    height: 266, 
    lineHeight: 25,
    paddingLeft: 10, 
    backgroundColor: '#FFFFFF', 
  },

  codeout: {
    margin: 20,
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
  copyrtext: {
    fontSize: 16, 
    color: UColor.fontColor,
  },

  tab: {
    flex: 1,
  },
});

export default TradeDetails;