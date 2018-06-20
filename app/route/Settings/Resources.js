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
          title: "资源管理",
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
  }
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'Calculation'){
      navigate('Calculation', {});
    }else if (key == 'Memory') {
      navigate('Memory', {});
    }else if (key == 'Network') {
      navigate('Network', {data});
    } if (key == 'Resources') {
      navigate('Resources', {data});
    }else {
      // EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View style={{ alignItems: 'center', flexDirection:'row', width: ScreenWidth-12, height: 80,  backgroundColor: '#586888', borderRadius: 5, }} onPress={this.goPage.bind(this, 'delegate')}>
                  <Image source={UImage.Calculation} style={{width: 40, height: 40, marginHorizontal: 20,}} />
                  <View  style={{flex: 1, justifyContent: "center", alignItems: 'flex-start', flexDirection:'column',}} >                               
                      <Text style={{ fontSize:16, color:'#FFFFFF', paddingBottom: 8, }}>计算资源</Text>
                      <View style={{ flexDirection:'row', alignItems: "center",}}>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>可用：0</Text>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>抵押：0.0000 EOS</Text>
                      </View>
                  </View>
                  <Text onPress={this.goPage.bind(this, 'Calculation')} style={{width: 40, lineHeight: 80, color: '#ffffff', textAlign: 'center'}}>></Text>
                </View> 
                <View style={{ alignItems: 'center', flexDirection:'row', width: ScreenWidth-12, height: 80,  backgroundColor: '#586888', borderRadius: 5, marginTop: 6,}} onPress={this.goPage.bind(this, 'delegate')}>
                  <Image source={UImage.network} style={{width: 40, height: 40, marginHorizontal: 20,}} />
                  <View  style={{flex: 1, justifyContent: "center", alignItems: 'flex-start', flexDirection:'column',}} >                               
                      <Text style={{ fontSize:16, color:'#FFFFFF', paddingBottom: 8, }}>网络资源</Text>
                      <View style={{ flexDirection:'row', alignItems: "center",}}>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>可用：0</Text>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>抵押：0.0000 EOS</Text>
                      </View>
                  </View>
                  <Text onPress={this.goPage.bind(this, 'Network')} style={{width: 40, lineHeight: 80, color: '#ffffff', textAlign: 'center'}}>></Text>
                </View> 
                <View style={{ alignItems: 'center', flexDirection:'row', width: ScreenWidth-12, height: 80,  backgroundColor: '#586888', borderRadius: 5, marginTop: 6, }} onPress={this.goPage.bind(this, 'delegate')}>
                  <Image source={UImage.Memory} style={{width: 40, height: 40, marginHorizontal: 20,}} />
                  <View  style={{flex: 1, justifyContent: "center", alignItems: 'flex-start', flexDirection:'column',}} >                               
                      <Text style={{ fontSize:16, color:'#FFFFFF', paddingBottom: 8, }}>内存资源</Text>
                      <View style={{ flexDirection:'row', alignItems: "center",}}>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>配额：3.01KB</Text>
                          <Text style={{fontSize: 13, color: '#8696B0'}}>占用：2.93 KB</Text>
                      </View>
                  </View>
                  <Text onPress={this.goPage.bind(this, 'Memory')} style={{width: 40, lineHeight: 80, color: '#ffffff', textAlign: 'center'}}>></Text>
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
      padding:6,
    },
})
export default Bvote;