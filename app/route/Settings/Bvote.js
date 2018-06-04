import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
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

@connect(({wallet}) => ({...wallet}))
class Bvote extends React.Component {
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "节点投票",
          headerStyle: {
            paddingTop:20,
            backgroundColor: "#586888",
          },
          headerRight: (<Button onPress={navigation.state.params.onPress}>
            <Text style={{color: "#8696B0", fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>邀请投票</Text>
          </Button>),            
        };
      };

  onPress(action){
    EasyDialog.show("温馨提示","部分功能将于6月份EOS上线主网后开通，敬请期待！","知道了",null,()=>{EasyDialog.dismis()});
  }

  _rightButtonClick = () =>{  
    DeviceEventEmitter.emit('voteShare',""); 
  }  

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({show:!isShow,});  
  }  
  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightButtonClick });
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,showShare:false,news:{}};
    this.config = [ 
        {  disable: true,  avatar:UImage.eos, name: "余额", subName: "0.00EOS", },
        {  avatar:UImage.imvote, name: "我的投票", onPress: this.goPage.bind(this, "Imvote") },
        {  avatar:UImage.Agent, name: "选择代理人", onPress: this.goPage.bind(this, "Nodevoting")},
      ];  
  }
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Imvote') {
      navigate('Imvote', {});
    }else if (key == 'set') {
      navigate('Set', {});
    }else if (key == 'Nodevoting') {
      navigate('Nodevoting', {});
    } else {
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  copy = () => {
    // let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken上线撒币啦，500,000EOS赠送新用户活动，太爽了~真是拿到手软，用我的邀请链接注册即获得"+(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))+"EOS。"+this.props.inviteInfo.inviteUrl+"#"+this.props.inviteInfo.code+"（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";
    let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken开放注册了，" + this.props.inviteInfo.inviteUrl + "（请复制链接到手机浏览器打开）（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";

    Clipboard.setString(msg);
    EasyDialog.show("复制成功", msg, "打开微信粘贴", "取消", () => { Linking.openURL('weixin://'); }, () => { EasyDialog.dismis() });
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View>
                   {this._renderListItem()}
                </View>    
                <View style={styles.pupuo}>
                  {/* <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                      <View style={styles.modalStyle}>
                          <View style={styles.subView} >
                              <View style={{ padding: 15 }}>
                                <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: "row", }}>
                                  <View style={{ flex: 1, }} />
                                    <QRCode size={100} style={{ width: 100, }} value={'{\"contract\":\"eos\",\"toaccount\":\"' + 'this.props.defaultWallet.account' + '\",\"symbol\":\"EOS\"}'} />
                                  <View style={{ flex: 1, }} />
                                </View>
                              </View>
                           
                              
                              <Button  onPress={this._setModalVisible.bind(this)}>
                                  <View style={{ margin: 10, height: 45, borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                                      <Text style={{ fontSize: 16, color: '#fff' }}>取消</Text>
                                  </View>
                              </Button>
                           
                          </View>
                      </View>
                  </Modal> */}
              </View>




                
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingTop:5,
    },
    row: {
      height:80,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      padding: 15,
      justifyContent: "space-between",
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
    top:{
      flex:2,
      flexDirection:"column",
    },
    footer:{
      paddingTop:5,
      height:60,    
      flexDirection:'row',  
      position:'absolute',
      backgroundColor:'#43536D',
      bottom: 0,
      left: 0,
      right: 0,
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
})
export default Bvote;