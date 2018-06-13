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
const maxHeight = Dimensions.get('window').height;
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
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: data.defaultWallet.account} });
            }
        });
    }

   


    addvote = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }
        var selectArr=[];
        const { dispatch } = this.props;
        // alert("this.props.voteData "+ JSON.stringify(this.props.voteData));
        this.props.voteData.forEach(element => {
            if(element.isChecked){
                // alert(" --- " + JSON.stringify(element));
                selectArr.push(element.account);
            }
        });
        
        // var producersList = "";
        // for(count=0;count<selectArr.length;count++){
        //     producersList += " " + selectArr[count]
        // } 
        // alert("producersList: " + producersList);

        // this.props.dispatch({ type: 'vote/addvote', payload: { keyArr: selectArr}});    
        // alert("this.props.defaultWallet.account: " + this.props.defaultWallet.account);
            const view =
            <View style={{ flexDirection: 'column', alignItems: 'center', }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', height: 45, width: 160, paddingBottom: 5, fontSize: 16, backgroundColor: '#FFF', borderBottomColor: '#586888', borderBottomWidth: 1, }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={{ fontSize: 14, color: '#808080', lineHeight: 25, marginTop: 5,}}>提示：为确保你的投票生效成功，EOS将进行锁仓三天，期间转账或撤票都可能导致投票失败。</Text>  
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
    
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
                                    producers: selectArr //["producer111j", "producer111p"]
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
                            EasyToast.show(errmsg);
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

    _openAgentInfo(coins) {
        const { navigate } = this.props.navigation;
        navigate('AgentInfo', {coins});
    }

    render() {
        return (
            <View style={styles.container}>
                 <View style={{flexDirection: 'row', backgroundColor: '#586888', height: 25,}}>         
                    <Text style={{ width:140,  color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>节点名称</Text>           
                    <Text style={{flex:1, color:'#FFFFFF', fontSize:16, textAlign:'center',  lineHeight:25,}}>排名/票数</Text>           
                    <Text style={{width:50, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>选择</Text>          
                </View>
                <ListView style={{flex:1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.voteData == null ? [] : this.props.voteData)} 
                    renderRow={(rowData, sectionID, rowID) => (                  
                            <View>
                                <Button onPress={this._openAgentInfo.bind(this,rowData)}> 
                                    <View style={{flexDirection: 'row', height: 60,}} backgroundColor={(parseInt(rowID)%2 == 0) ? "#43536D" : "#4E5E7B"}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                            <Image source={{uri: rowData.icon}} style={{width: 30, height: 30, margin: 10,}}/>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                            <Text style={{ color:'#FFFFFF', fontSize:14,}} >{rowData.name}</Text>
                                            <Text style={{ color:'#7787A3', fontSize:14,}} >地区：{rowData.region}</Text>                                    
                                        </View>
                                        <View style={{flex:1,justifyContent: 'center', alignItems: 'center', }}>
                                            <Text style={{ color:'#FFFFFF', fontSize:14,}}>{rowData.ranking}</Text>
                                            <Text style={{ color:'#7787A3', fontSize:14,}}>{parseInt(rowData.total_votes)}</Text> 
                                        </View>
                                        <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center',}} onPress={ () => this.selectItem(rowData)}>
                                            <View style={{width: 27, height: 27, margin: 5, borderColor:'#586888',borderWidth:2,}} >
                                                <Image source={rowData.isChecked ? UImage.Tick:null} style={{ width: 25, height: 25 }} />
                                            </View>  
                                        </TouchableOpacity>  
                                    </View> 
                                </Button>  
                            </View>             
                        )}                                   
                    /> 
              
                <View style={styles.footer}>
                    <Button style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Text style={{  fontSize: 18, color: '#F3F4F4' }}>{this.props.producers == null ? 30 : 30 - this.props.producers.length}</Text>
                            <Text style={{  fontSize: 14, color: '#8696B0' }}>剩余可投节点</Text>
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
      height: 50,
      flexDirection: 'row',
      backgroundColor: '#43536D',
    },
   
    
    });

export default Nodevoting;
