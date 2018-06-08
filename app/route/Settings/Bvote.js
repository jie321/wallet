import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,ImageBackground} from 'react-native';
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
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },
          headerRight: (<Button onPress={navigation.state.params.onPress}>
            <Text style={{color: "#8696B0", fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>邀请投票</Text>
          </Button>),            
        };
      };


  _rightTopClick = () =>{  
    DeviceEventEmitter.emit('voteShare',""); 
  }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,showShare:false,news:{}};
      // this.config = [ 
      //     // {  disable: true,  avatar:UImage.eos, name: "余额", subName: "0.00EOS", },
      //     {  avatar:UImage.eos, name: "抵押", onPress: this.goPage.bind(this, "delegate") },
      //     {  avatar:UImage.imvote, name: "我的投票", onPress: this.goPage.bind(this, "Imvote") },
      //     {  avatar:UImage.Agent, name: "选择代理人", onPress: this.goPage.bind(this, "Nodevoting")},
      //   ];  
  }
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'delegate'){
      navigate('Delegate', {});
    }else if (key == 'Imvote') {
      navigate('Imvote', {});
    }else if (key == 'Nodevoting') {
      navigate('Nodevoting', {data});
    } else {
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }
  _goPage() {
    alert('1');
  }

  // _renderListItem() {
  //   return this.config.map((item, i) => {
  //     return (<Item key={i} {...item} />)
  //   })
  // }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <ImageBackground  style={{ justifyContent: "flex-end", alignItems: 'center', flexDirection:'row', width: ScreenWidth-10, height: 115,  paddingRight: 10,}} source={UImage.votea_bj} resizeMode="stretch">              
                  <Text onPress={this.goPage.bind(this, 'delegate')} style={{fontSize:16, color:'#FFFFFF'}}>投票前划分锁仓</Text>
                  <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                      <Image source={UImage.votea} style={{width: 30, height: 30, margin: 10,}}/>
                  </View>     
                </ImageBackground>
                <ImageBackground  style={{ justifyContent: "flex-end", alignItems: 'center', flexDirection:'row', width: ScreenWidth-10, height: 115, marginTop: 6, paddingRight: 10,}} source={UImage.voteb_bj} resizeMode="stretch">              
                  <Text onPress={this.goPage.bind(this, 'Imvote')} style={{fontSize:16, color:'#FFFFFF'}}>你的投票信息</Text>
                  <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                      <Image source={UImage.voteb} style={{width: 30, height: 30, margin: 10,}}/>
                  </View>     
                </ImageBackground>           
                <ImageBackground  style={{ justifyContent: "flex-end", alignItems: 'center', flexDirection:'row', width: ScreenWidth-10, height: 115, marginTop: 6, paddingRight: 10, }} source={UImage.votec_bj} resizeMode="stretch">              
                  <Text onPress={this.goPage.bind(this, 'Nodevoting')}  style={{fontSize:16, color:'#FFFFFF'}}>选择代理节点</Text>
                  <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                      <Image source={UImage.votec} style={{width: 30, height: 30, margin: 10,}}/>
                  </View>     
                </ImageBackground>         
                {/* <View>
                   {this._renderListItem()}
                </View>     */}
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      padding:6,
    },
})
export default Bvote;