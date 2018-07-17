import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants';
const ScreenWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

// @connect(({ login }) => ({ ...login }))
class ActivationAt extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
       
        return {                       
          headerTitle:'激活账户',
          headerStyle:{
                  paddingTop:Platform.OS == 'ios' ? 30 : 20,
                  backgroundColor: UColor.mainColor,
                  borderBottomWidth:0,
                },
          headerRight: (<Button  onPress={navigation.state.params.onPress}>  
                <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>请朋友支付</Text>
          </Button>),                  
        };
      };

      _rightTopClick = () =>{
        const { navigate } = this.props.navigation;
        navigate('Coin_search', {});
      }

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
        password: "",
        ownerPk: '',
        activePk: '',
        show: false,
    };
  }

  importActivation() {
    const { navigate } = this.props.navigation;
    navigate('ActivationAt', {});
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }


    render() {
        return (<View style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <View style={styles.header}>
                    <View style={styles.inptoutbg}>
                        <View style={styles.headout}>
                            <Text style={styles.inptitle}>重要说明：</Text>
                            <Text style={styles.headtitle}>创建EOS账户需要消耗EOS，支付完成后将激活该账户目前创建一个EOS账户成本价约***EOS</Text>
                        </View>  
                        <View style={styles.inptoutgo} >
                            <Text style={styles.inptitle}>你的EOS账户信息如下</Text>
                            <View style={styles.inptgo}>
                                <Text style={styles.headtitle}>账户名称：0000000000</Text>
                                <Text style={styles.headtitle}>拥有者权限：00000000000</Text>
                                <Text style={styles.headtitle}>管理者权限：00000000000</Text>
                            </View>
                        </View>
                        <View style={styles.headout}>
                            <Text style={styles.inptitle}>扫码激活说明</Text>
                            <Text style={styles.headtitle}>用另一个有效的EOS账号或请求朋友帮助您支付激活，也可以联系官方小助手购买积分激活账号</Text>
                        </View>
                        <View style={styles.codeout}>
                            <View style={styles.qrcode}>
                               <QRCode size={120} value={'https://eosmonitor.io/txn/1355'} />
                            </View>
                        </View> 
                    </View> 
                    <Button onPress={() => this.importActivation()}>
                        <View style={styles.importPriout}>
                            <Text style={styles.importPritext}>激活（已支付完成）</Text>
                        </View>
                    </Button>
                    <Button onPress={() => this.importActivation()}>
                        <View style={styles.importPriout}>
                            <Text style={styles.importPritext}>联系官方小助手激活</Text>
                        </View>
                    </Button>
                    <Button onPress={() => this.importActivation()}>
                        <View style={styles.deleteout}>
                            <Text style={styles.delete}>删除账户放弃</Text>
                        </View>
                    </Button>
                </View>
            </TouchableOpacity>
         </ScrollView> 
     </View>)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
    },
    header: {
        marginTop: 10,
        backgroundColor: UColor.mainColor,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
    },
    headout: {
        paddingTop: 10,
    },
    inptoutgo: {
        paddingTop: 15,
        backgroundColor: UColor.mainColor,
    },
    inptitle: {
        flex: 1,
        fontSize: 15,
        lineHeight: 30,
        color: UColor.fontColor,
    },
    inptgo: {
        height: 120,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: UColor.secdColor,
    },
    headtitle: {
        color: UColor.arrow,
        fontSize: 14,
        lineHeight: 25,
    },

    codeout: {
        flex: 1,
        margin: 20,
        alignItems: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    qrcode: {
        backgroundColor: UColor.fontColor,
        padding: 5
    },

    importPriout: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor:  UColor.tintColor,
    },
    importPritext: {
        fontSize: 15,
        color: UColor.fontColor,
    },

    deleteout: {
        height: 45, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginHorizontal: 20,
        borderRadius: 5,
        marginBottom: 30,
        backgroundColor: UColor.showy,
    },
    delete: {
        fontSize: 15,
        color: UColor.fontColor,
    },

});
export default ActivationAt;