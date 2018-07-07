import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, Clipboard, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";

@connect(({ wallet }) => ({ ...wallet }))
class Info extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.coinType.name,
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
            show: false,
            balance: this.props.navigation.state.params.balance,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            type: '',
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            try {
                this.getBalance();
                DeviceEventEmitter.emit('wallet_info');
            } catch (error) {
            }
        });
    }

    componentDidMount() {
        //加载地址数据
        this.props.dispatch({ type: 'wallet/getDefaultWallet' });

        // DeviceEventEmitter.addListener('transfer_result', (result) => {
        //     EasyToast.show('交易成功：刷新交易记录');
        this.props.dispatch({ type: 'wallet/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, pos :"1",  offset :"99999"}}); 
        //     if (result.success) {
        //         // this.props.navigation.goBack();
        //     } else {
        //         EasyToast.show('交易失败：' + result.result);
        //     }
        // });
        // alert('updateDefaultWallet: '+(this.props.defaultWallet.name));
        DeviceEventEmitter.addListener('eos_balance', (data) => {
            this.setEosBalance(data);
        });
    }

    setEosBalance(data){
        if (data.code == '0') {
            if (data.data == "") {
                this.setState({ balance: '0.0000' })
            } else {
                this.setState({ balance: data.data })
            }
        } else {
            // EasyToast.show('获取余额失败：' + data.msg);
        }
    }

    // _rightButtonClick() {
    //     AnalyticsUtil.onEvent('To_change_into');
    //     this._setModalVisible();
    // }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    turnIn(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnIn', {});
    }

    turnOut(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOut', { coins, balance: this.state.balance });
    }

    getBalance() {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
                this.setEosBalance(data);
            }
        })
    }

    copy = () => {
        let address = this.props.defaultWallet.account;
        Clipboard.setString(address);
        EasyToast.show("复制成功");
        this._setModalVisible();
    }
    _openDetails(trade) {  
        const { navigate } = this.props.navigation;
        navigate('TradeDetails', {trade});
    }


    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headbalance}>{this.state.balance.replace("EOS", "")} EOS</Text>
                    <Text style={styles.headmarket}>≈ {(this.state.balance==null || this.state.balance == "")? '0.00' : (this.state.balance.replace("EOS", "")*c.value).toFixed(2)} ￥</Text>
                </View>
                <View style={styles.btn}>
                    <Text style={styles.latelytext}>最近交易记录</Text>
                    {this.props.DetailsData == null && <View style={styles.nothave}><Text style={styles.copytext}>还没有交易哟~</Text></View>}
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.DetailsData == null ? [] : this.props.DetailsData)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <Button onPress={this._openDetails.bind(this,rowData)}> 
                            <View style={styles.row}>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={styles.timetext}>时间 : {rowData.blockTime}</Text>
                                        <Text style={styles.quantity}>数量 : {rowData.quantity.replace("EOS", "")}</Text>
                                    </View>
                                    <View style={styles.typedescription}>
                                       {rowData.type == '转出' ? 
                                       <Text style={styles.typeto}>类型 : {rowData.type}</Text>
                                       :
                                       <Text style={styles.typeout}>类型 : {rowData.type}</Text>
                                       }
                                        <Text style={styles.description}>（{rowData.description}）</Text>
                                    </View>
                                </View>
                                <View style={styles.Ionicout}>
                                    <Ionicons style={styles.Ionico} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </Button>  
                    </View>         
                     )}                
                 /> 
                </View>

                <View style={styles.footer}>
                    <Button onPress={this.turnIn.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.shift_to} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转入</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOut.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.turn_out} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转出</Text>
                        </View>
                    </Button>
                </View>
                {/* <View style={styles.pupuo}>
                    <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                        <View style={styles.modalStyle}>
                            <View style={styles.subView} >
                                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                                    <Text style={styles.buttoncols}>×</Text>
                                </Button>
                                <Text style={styles.titleText}>您的{c.name}地址</Text>
                                <Text style={styles.contentText}>{this.props.defaultWallet == null ? '' : this.props.defaultWallet.account}</Text>
                                <Text style={styles.prompttext}>提示：扫码同样可获取账户</Text>
                                <View style={styles.codeout}>
                                    <View style={styles.tab} />
                                    <QRCode size={170}  value={'{\"contract\":\"eos\",\"toaccount\":\"' + this.props.defaultWallet.account + '\",\"symbol\":\"EOS\"}'} />
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
                </View> */}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    header: {
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        backgroundColor: UColor.mainColor,
    },
    headbalance: {
        fontSize: 20, 
        color: UColor.fontColor
    },
    headmarket: {
        fontSize: 14,
        color: UColor.arrow,
        marginTop: 5
    },

    tab: {
        flex: 1,
    },
    btn: {
        flex: 1,
        paddingBottom: 60,
    },

    latelytext: {
        fontSize: 14,
        color: UColor.arrow,
        margin: 5
    },
    nothave: {
        height: Platform.OS == 'ios' ? 84.5 : 65,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: 20,
        borderRadius: 5,
        margin: 5,
    },
    row: {
        height: Platform.OS == 'ios' ? 84.5 : 65,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 20,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    timequantity: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    timetext: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'left'
    },
    quantity: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'left',
        marginTop: 3
    },
    description: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'center',
        marginTop: 3
    },
    typedescription: {
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    typeto: {
        fontSize: 14,
        color: UColor.tintColor,
        textAlign: 'center'
    },
    typeout: {
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'center'
    },

    Ionicout: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    Ionico: {
        color: UColor.arrow,   
    },


    footer: {
        paddingTop: 5,
        height: 60,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },
    shiftshiftturnout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginRight: 1,
        backgroundColor: UColor.mainColor,
    },
    shiftturn: {
        width: 30, 
        height: 30
    },
    shifttoturnout: {
        marginLeft: 20,
        fontSize: 18,
        color: UColor.fontColor
    },

    pupuo: {
        // flex:1,  
        backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: { 
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor:  UColor.mask,
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
        borderColor: UColor.baseline,
    },
     // 关闭按钮  
    buttonView: {
        alignItems: 'flex-end',
    },
    buttoncols: {
        width: 30,
        height: 30,
        marginBottom: 0,
        color: '#CBCBCB',
        fontSize: 28,
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
        marginLeft: 15,
        fontSize: 12,
        textAlign: 'center',
    },
    prompttext: {
        color: '#F45353',
        fontSize: 12,
        marginLeft: 15,
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
        color: UColor.fontColor
    },

})
export default Info;