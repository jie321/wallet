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

@connect(({vote}) => ({...vote}))
class Imvote extends React.Component {
 
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "我的投票",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },      
        };
      };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                if(!data || !data.defaultWallet || !data.defaultWallet.account){
                    EasyToast.show("请先创建钱包");
                }else{
                    this.props.dispatch({ type: 'vote/getvotinginfo', payload: { voter: data.defaultWallet.account} });
                }
            }
        });

    }

    deleteItem = () => { // 删除
        let {selectMap} = this.state;
        let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        // alert("确认撤票" + valueArr)
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

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
                        EasyToast.show("撤票成功");
                    }else if(r.data && JSON.parse(r.data).code != 0){
                        var jdata = JSON.parse(r.data);
                        var errmsg = "投撤票失败: ";
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


    selectItem = (item) => { // 单选
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }

    _openAgentInfo() {
        const { navigate } = this.props.navigation;
        navigate('AgentInfo', {});
        // this._setModalVisible();
    }


    render() {
        return (
            <View style={styles.container}>
                 <View style={{flexDirection: 'row', backgroundColor: '#586888',}}>         
                    <Text style={{ width:140,  color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>节点名称</Text>           
                    <Text style={{flex:1, color:'#FFFFFF', fontSize:16, textAlign:'center',  lineHeight:25,}}>排名/票数</Text>           
                    <Text style={{width:50, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>选择</Text>        
                </View>
                <ListView style={{flex:1,}} renderRow={this.renderRow} enableEmptySections={true} 
               
                dataSource={this.state.dataSource.cloneWithRows(this.props.voteData == null ? [] : this.props.voteData)} 
                //dataSource={this.state.dataSource.cloneWithRows(list.data == null ? [] : JSON.parse(list.data).rows)} 
                renderRow={(rowData, sectionID, rowID) => ( // cell样式                 
                    <View>
                        <Button onPress={this._openAgentInfo.bind(this)}> 
                            <View style={{flexDirection: 'row', height: 60,}} backgroundColor={rowID%2 ==0?"#43536D":" #4E5E7B"}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                    <Image source={UImage.eos} style={{width: 30, height: 30, margin: 5,}}/>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                    <Text style={{ color:'#FFFFFF', fontSize:14,}} >{rowData.owner}</Text>
                                    <Text style={{ color:'#7787A3', fontSize:14,}} >地区：新加坡</Text>
                                </View>
                                <View style={{flex:1,justifyContent: 'center', alignItems: 'center', }}>
                                    <Text style={{ color:'#FFFFFF', fontSize:14,}}>18</Text>
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
                    <Button  style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Text style={{ fontSize: 18, color: '#F3F4F4' }}>23</Text>
                            <Text style={{ fontSize: 14, color: '#8696B0' }}>剩余可投票数</Text>
                        </View>
                    </Button>
                    <Button onPress={this.deleteItem.bind(this)} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginLeft: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.vote_h} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>撤票</Text>
                        </View>
                    </Button>
                </View>  
            </View>
        );
    }

     //渲染页面
    // render() {
    //     const v = (
    //     <ListView
    //         renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
    //         style={{ backgroundColor: UColor.secdColor }}
    //         enableEmptySections={true}
    //         onEndReachedThreshold={20}
    //         dataSource={this.state.dataSource.cloneWithRows(this.props.voteData.rows == null ? [] : JSON.parse(this.props.voteData).rows)}
    //         renderRow={(rowData) => (
    //             <View>asdfasdf</View>
    //         )}
    //     />
    //     );
    //     return (v);
    // }
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

export default Imvote;
