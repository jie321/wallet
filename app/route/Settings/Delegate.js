import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import {EasyDialog} from '../../components/Dialog'
import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet}) => ({...wallet}))
class Nodevoting extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "投票",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },
          headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ padding: 15 }}>
                <Image source={UImage.Magnifier} style={{ width: 30, height: 30 }}></Image>
            </View>
          </Button>),            
        };
      };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    componentDidMount() {
        this.props.dispatch({ type: 'vote/list', payload: { page:1} });
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                if (data != null && data.defaultWallet.account != null) {
                    // this.getBalance(data);
                } else {
                    EasyToast.show('获取账号信息失败');
                }
            }
        });
    }

    _openNodeDetails() {
        // this._setModalVisible();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    // 抵押
    delegatebw = () => {
        const view =
        <View style={{ flexDirection: 'row' }}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                secureTextEntry={true}
                keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>

        EasyDialog.show("密码", view, "确认", "取消", () => {

        if (this.state.password == "") {
            EasyToast.show('请输入密码');
            return;
        }
        EasyLoading.show();

        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);

                // 抵押
                Eos.transaction({
                    actions:[
                        {
                            account: 'eosio',
                            name: 'delegatebw',
                            authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                            }],
                            data:{
                                from: this.props.defaultWallet.account,
                                receiver: this.props.defaultWallet.account,
                                stake_net_quantity: "50 EOS",
                                stake_cpu_quantity: "50 EOS",
                                transfer: 0
                            }
                        }
                    ]
                }, plaintext_privateKey, (r) => {
                    EasyLoading.dismis();
                    if(r.data && r.data.transaction_id){
                        EasyToast.show("抵押成功");
                    }else if(r.data && JSON.parse(r.data).code != 0){
                        var jdata = JSON.parse(r.data);
                        var errmsg = "抵押失败: ";
                        if(jdata.error.details[0].message){
                            errmsg = errmsg + jdata.error.details[0].message;
                        }
                        alert(errmsg);
                    }

                    // alert(JSON.parse(r.data).code);
                }); 
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            // alert("-----------密码错误");
            EasyLoading.dismis();
            EasyToast.show('密码错误');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() }); 
    }

    undelegatebw = () => { 
            const view =
            <View style={{ flexDirection: 'row' }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
    
            EasyDialog.show("密码", view, "确认", "取消", () => {
    
            if (this.state.password == "") {
                EasyToast.show('请输入密码');
                return;
            }
            EasyLoading.show();

            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // alert("plaintext_privateKey "+plaintext_privateKey);

                    // 解除抵押
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'undelegatebw',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    from: this.props.defaultWallet.account,
                                    receiver: this.props.defaultWallet.account,
                                    unstake_net_quantity: "1000 EOS",
                                    unstake_cpu_quantity: "1000 EOS",
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        if(r.data && r.data.transaction_id){
                            EasyToast.show("解除抵押成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "解除抵押失败: ";
                            if(jdata.error.details[0].message){
                                errmsg = errmsg + jdata.error.details[0].message;
                            }
                            alert(errmsg);
                        }
                    }); 

                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                // alert("-----------密码错误");
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    };


    selectItem = (item) => { 
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }


    render() {
        return (
            <View style={styles.container}>              
                <View style={styles.footer}>
                    <Button  onPress={this.delegatebw.bind()} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.vote} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>抵押</Text>
                        </View>
                    </Button>
                    <Button onPress={this.undelegatebw.bind()} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginLeft: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.vote} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>解除抵押</Text>
                        </View>
                    </Button>
                </View>         
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },
    footer: {
      height: 60,
      flexDirection: 'row',
      backgroundColor: '#43536D',
    },
    pupuo: {
      // flex:1,  
      backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        // backgroundColor:'#ccc',  
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        flex:1,
        paddingTop: 5,
        fontSize: 16,
        textAlign: 'left',    
        lineHeight:30,
    },
    
    });

export default Nodevoting;
