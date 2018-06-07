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

@connect(({vote, wallet}) => ({...vote, ...wallet}))
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


    addvote = (rowData) => { // 选中用户
        var selectArr=[];
        const { dispatch } = this.props;
        this.props.voteData.forEach(element => {
            if(element.isChecked){
                selectArr.push(element);
            }
        });
        // this.props.dispatch({ type: 'vote/addvote', payload: { keyArr: selectArr}});    
        // alert("this.props.defaultWallet.account: " + this.props.defaultWallet.account);
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

                    //投票
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'voteproducer',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    voter: this.props.defaultWallet.account,
                                    proxy: '',
                                    producers: ["producer111j", "producer111p"]
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        // alert(JSON.stringify(r.data));
                        if(r.data && r.data.transaction_id){
                            EasyToast.show("投票成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "投票失败: ";
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
                 <View style={{flexDirection: 'row', backgroundColor: '#586888',}}>         
                    <Text style={{ width:100,  color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>排名/用户</Text>           
                    <Text style={{flex:1, color:'#FFFFFF', fontSize:16, textAlign:'center',  lineHeight:25,}}>票数（EOS）</Text>           
                    <Text style={{width:60, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>选择</Text>          
                </View>
                <ListView style={{flex:1,}} renderRow={this.renderRow} enableEmptySections={true} 
               
                dataSource={this.state.dataSource.cloneWithRows(this.props.voteData == null ? [] : this.props.voteData)} 
                //dataSource={this.state.dataSource.cloneWithRows(list.data == null ? [] : JSON.parse(list.data).rows)} 
                renderRow={(rowData, sectionID, rowID) => ( // cell样式                 
                        <View  >
                            <Button onPress={this._openNodeDetails.bind(this)}> 
                                <View style={{flexDirection: 'row', height: 40,}} backgroundColor={rowID%2 ==0?"#43536D":" #4E5E7B"}>
                                    <View style={{ width:120, justifyContent: 'center', alignItems: 'flex-start', }}>
                                        <Text style={{ paddingLeft:5, color:'#FFFFFF', fontSize:16,}} >{rowData.owner}</Text>
                                    </View>
                                    <View style={{flex:1,justifyContent: 'center', alignItems: 'flex-end', }}>
                                        <Text style={{ color:'#FFFFFF', fontSize:16,}}>{parseInt(rowData.total_votes)}</Text>
                                    </View>
                                    <TouchableOpacity style={{width:60,justifyContent: 'center', alignItems: 'center',}} onPress={ () => this.selectItem(rowData)}>
                                        <View style={{width: 27, height: 27, margin:5, borderColor:'#586888',borderWidth:2,}} >
                                            <Image source={rowData.isChecked ? UImage.Tick:null} style={{ width: 25, height: 25 }} />
                                        </View>  
                                    </TouchableOpacity>  
                                </View> 
                            </Button>  
                        </View>             
                    )}                                     
                /> 
              
                <View style={styles.footer}>
                    <Button  style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Text style={{ marginLeft: 20, fontSize: 18, color: '#F3F4F4' }}>123465</Text>
                            <Text style={{ marginLeft: 20, fontSize: 14, color: '#8696B0' }}>剩余可投票数</Text>
                        </View>
                    </Button>
                    <Button onPress={this.addvote.bind()} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginLeft: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.vote} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>投票</Text>
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
