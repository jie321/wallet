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
      
    };
  }

  componentDidMount() {
        // alert('trade: '+JSON.stringify(this.props.navigation.state.params.trade));
  }
  
  
  render() {
    const c = this.props.navigation.state.params.trade;
    return <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.headout}>
                <Text style={styles.quantitytext}>{c.quantity}</Text>
                {/* <Text style={styles.headtext}> bytes</Text> */}
            </View>
            <Text style={styles.description}>（{c.description} {c.bytes? c.bytes + " bytes":""}）</Text>
        </View>
        <View style={styles.conout}>
            <Text style={styles.context}>发送方：{c.from}</Text>
            <Text style={styles.context}>接受方：{c.to}</Text>
            <Text style={styles.context}>区块高度：{c.blockNum}</Text>
            <Text style={styles.context}>备注：{c.memo}</Text>
        </View>
        <Text style={styles.blocktime}>{c.blockTime}</Text>
        <View style={styles.codeout}>
            <View style={styles.qrcode}>
               <QRCode size={105} value={'https://eosmonitor.io/txn/' + c.transactionId } />
            </View>
        </View>
        <Text style={styles.tradehint}>交易号：{c.transactionId.substring(0, 15) +"..."+ c.transactionId.substr(c.transactionId.length-15) }</Text>
        <Text style={styles.tradehint}>提示：扫码可获取区块交易状态</Text>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
 
  header: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: UColor.mainColor,
    borderBottomWidth: 0.5,
  },
  headout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantitytext: {
    fontSize: 30,
    color: UColor.fontColor
  },
  headtext: {
    fontSize: 15,
    color: UColor.fontColor,
    paddingTop: 10,
  },
  description: {
    height: 35,
    fontSize: 14,
    color: UColor.tintColor,
  },
  conout: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderBottomColor: UColor.mainColor,
    borderBottomWidth: 0.5,
  },
  context: {
    fontSize: 14,
    color: UColor.arrow,
    paddingTop: 10,
  },

  blocktime: {
    fontSize: 14,
    color: UColor.fontColor,
    textAlign: 'right',
    lineHeight: 30,
    marginRight: 10,
  },
  codeout: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: 5,
  },
 
  tradehint: {
    fontSize: 14,
    color: UColor.arrow,
    paddingTop: 10,
    paddingHorizontal: 25,
  },
});

export default TradeDetails;