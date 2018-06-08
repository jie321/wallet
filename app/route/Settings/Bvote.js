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
      this.config = [ 
          // {  disable: true,  avatar:UImage.eos, name: "余额", subName: "0.00EOS", },
          {  avatar:UImage.eos, name: "抵押", onPress: this.goPage.bind(this, "delegate") },
          {  avatar:UImage.imvote, name: "我的投票", onPress: this.goPage.bind(this, "Imvote") },
          {  avatar:UImage.Agent, name: "选择代理人", onPress: this.goPage.bind(this, "Nodevoting")},
        ];  
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

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View>
                   {this._renderListItem()}
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
})
export default Bvote;