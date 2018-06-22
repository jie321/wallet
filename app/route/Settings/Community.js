import React from 'react';
import { connect } from 'react-redux'
import {Clipboard,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, ImageBackground, FlatList} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;


@connect(({login}) => ({...login}))
class Community extends React.Component {


  static navigationOptions = {
    title: 'EOS社区',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      },
  };

  constructor(props) {
    super(props);
    this.state = {
        wechat: 'EOS-TOKEN',
        public: 'Etoken钱包',
        qq: '3090679927',
        telegraph: 't.me/eostokens',
    }
  }
  
  logout = () =>{
    if(this.props.loginUser){
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
        AnalyticsUtil.onEvent('Sign_out');
      }});
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    } 
  }

  prot(key, data = {}) { 
    if (key == 'microblog') {
      const { navigate } = this.props.navigation;
        navigate('Web', { title: "官网微博", url: "http://weibo.com/eostoken" });   
    } else if(key == 'wechat'){
        // let wechat = this.state.wechat;
        Clipboard.setString(this.state.wechat);
        EasyToast.show('微信号已复制成功');
    } else if(key == 'qq'){
      // let qq = this.state.qq;
      Clipboard.setString(this.state.qq);
      EasyToast.show('QQ号已复制成功');
    }else if(key == 'public'){
      Clipboard.setString(this.state.public);
      EasyToast.show('微信公众号已复制成功');
    }else if(key == 'telegraph'){
      Clipboard.setString(this.state.telegraph);
      EasyToast.show('电报群号已复制成功');
    }
}
  

  render() {
    return <View style={styles.container}>    
        <Image source={UImage.cmyhead} style={{width:maxWidth, height:90, marginTop: 5,}} />
          <View style={{padding: 4,}} >
            <View style={{flexDirection:'row', height: 118,}}>
              <ImageBackground style={{ justifyContent: "center", alignItems: 'flex-start', flex: 1, flexDirection:'row', marginRight: 2, paddingLeft: 5, paddingTop: 5,}} source={UImage.cmy_wx} resizeMode="stretch">                  
                <Text style={styles.textname}>官方微信：</Text>
                <Text onPress={this.prot.bind(this, 'wechat')} style={styles.textlink}>{this.state.wechat}</Text>           
              </ImageBackground>
              <ImageBackground style={{ justifyContent: "center", alignItems: 'flex-start', flex: 1, flexDirection:'row', marginLeft: 2, paddingLeft: 5, paddingTop: 5,}} source={UImage.cmy_qq} resizeMode="stretch">          
                <Text style={styles.textname}>官方QQ：</Text>
                <Text onPress={this.prot.bind(this, 'qq')}  style={styles.textlink}>{this.state.qq}</Text>           
              </ImageBackground>        
            </View>
            <ImageBackground style={{ justifyContent: "flex-start", alignItems: 'flex-start', flexDirection:'row', width: maxWidth-10, height: 135, marginTop: 4, paddingLeft: 10, paddingTop: 10,}} source={UImage.cmy_gzh} resizeMode="stretch">              
              <Text style={styles.textname}>官方公众号：</Text>
              <Text onPress={this.prot.bind(this, 'public')} style={styles.textlink}>{this.state.public}</Text>     
            </ImageBackground>
            <ImageBackground style={{ justifyContent: "flex-start", alignItems: 'center',flexDirection:'row', width: maxWidth-10, height: 55, marginTop: 4, paddingLeft: 10,}} source={UImage.cmy_wb} resizeMode="stretch">            
              <Text style={styles.textname}>官方微博：</Text>
              <Text onPress={this.prot.bind(this, 'microblog')} style={styles.textlink}>weibo.com/eostoken</Text>         
            </ImageBackground>             
            <ImageBackground style={{ justifyContent: "flex-start",  alignItems: 'center', flexDirection:'row', width: maxWidth-10, height: 55, marginTop: 4, paddingLeft: 10,}} source={UImage.cmy_db} resizeMode="stretch">       
              <Text style={styles.textname}>EosToken电报群：</Text>
              <Text onPress={this.prot.bind(this, 'telegraph')}  style={styles.textlink}>{this.state.telegraph}</Text>
            </ImageBackground>        
          </View>   
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },
  texts: {
    height:35, 
    paddingLeft:20, 
    justifyContent:'center',
    alignItems:'center',  
    flexDirection:'row',
  },
  textname: {
    fontSize:16,
    color:'#FFFFFF'
  },
  textlink: {
    fontSize: 16, 
    color: '#65CAFF',
  }

});

export default Community;
