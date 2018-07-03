import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import JPush from 'jpush-react-native';
export var jpushSwitch = false;
import JPushModule from 'jpush-react-native';
import { EasyLoading } from '../../components/Loading';

@connect(({wallet, assets}) => ({...wallet, ...assets}))
class Add_assets extends React.Component {
    static navigationOptions = ({ navigation }) => {
    
       
        return {                       
          headerTitle:'添加资产',
          headerStyle:{
                  paddingTop:Platform.OS == 'ios' ? 30 : 20,
                  backgroundColor: UColor.mainColor,
                },
          headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ padding: 15 }}>
                <Image source={UImage.Magnifier} style={{ width: 30, height: 30 }}></Image>
            </View>
          </Button>),                  
        };
      };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      show:false,
      value: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null
    };
  }


  componentDidMount() {
    this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
    this.props.dispatch({ type: 'assets/myAssetInfo'});
    DeviceEventEmitter.addListener('updateAssetList', (data) => {
      this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
    });
  }

  _rightTopClick = () =>{
    const { navigate } = this.props.navigation;
    navigate('Coin_search', {});
  }

  onBackAndroid = () => {
    if (cangoback) {
      let type = this.state.routes[this.state.index]
      let w = this.web[type.key];
      if (w) {
        w.goBack();
        return true;
      }
    }
  }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.props.types.length; i++) {
      if (this.props.types[i].key == typeId) {
        return i;
      }
    }
  }

  getCurrentRoute() {
    return this.props.types[this.state.index];
  }

  //加载更多
  onEndReached(typeId) {
    pages[index] += 1;
    currentLoadMoreTypeId = typeId;
    const time = Date.parse(new Date()) / 1000;
    const index = this.getRouteIndex(typeId);
    if (time - loadMoreTime > 1) {
      pages[index] += 1;
      this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: pages[index] } });
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  };

  //下拉刷新
  onRefresh = (typeId, refresh) => {
    this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: 1, newsRefresh: refresh } });
    const index = this.getRouteIndex(typeId);
    if (index >= 0) {
      pages[index] = 1;
    }
  };

    

  onPress(action){
    EasyDialog.show("温馨提示","该功能正在紧急开发中，敬请期待!","知道了",null,()=>{EasyDialog.dismis()});
  }

  _rightButtonClick() {  
    this._setModalVisible();  
  }  

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  addAsset(asset, value) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
      return;
    }

    EasyLoading.show();
    this.props.dispatch({ type: 'assets/addMyAsset', payload: {asset: asset, value: value}, callback: (data) => {
      EasyLoading.dismis;
    } });
  }

  isMyAsset(rowData){
    if(this.props.myAssets == null){
        return false;
    }
    
    if(this.state.selectasset != null && this.state.selectasset.name == rowData.name){
      if(this.state.value){
        return true;
      }else{
        return false;
      }
    }

    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].asset.name == rowData.name ){
            return true;
        } 
    }

    return false;
 }
  
 render() {
        return (
            <View style={styles.container}>
                <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
                  dataSource={this.state.dataSource.cloneWithRows(this.props.assetsData == null ? [] : this.props.assetsData)} 
                  renderRow={(rowData, sectionID, rowID) => (      
                  <View style={styles.listItem}>
                      <View style={styles.listInfo}>
                        <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={{width: 28, height: 28, resizeMode: "cover", overflow:"hidden", borderRadius: 18, marginRight:10,}}/>
                        <View style={styles.scrollView}>
                          <Text style={styles.listInfoTitle}>{rowData.name}</Text>
                        </View>
                        <View style={styles.listInfoRight}>
                          <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor="#ffffff"
                              value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                              this.setState({selectasset: rowData, value: value});
                              this.addAsset(rowData, value);
                          }}/>
                        </View>
                      </View>
                  </View>
                  )}                
                /> 
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

    listItem: {
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
   
    listInfo: {
      height: 65,
      flex: 1,
      paddingLeft: 16,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth:1,
      borderTopColor: UColor.secdColor
    },
    scrollView: {
      flex: 1,
    },
    listInfoTitle: {
      color:UColor.fontColor, 
      fontSize:16
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center"
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
      backgroundColor: UColor.secdColor,
      bottom: 0,
      left: 0,
      right: 0,
    },

    pupuo:{  
      backgroundColor: '#ECECF0',  
    },  
    // modal的样式  
    modalStyle: {  
      backgroundColor: UColor.mask,  
      alignItems: 'center',  
      justifyContent:'center',  
      flex:1,  
    },  
    // modal上子View的样式  
    subView:{  
      marginLeft:10,  
      marginRight:10,  
      backgroundColor:  UColor.fontColor,  
      alignSelf: 'stretch',  
      justifyContent:'center',  
      borderRadius: 10,  
      borderWidth: 0.5,  
      borderColor: UColor.mask,  
    },  
    // 标题  
    titleText:{   
      marginBottom:5,  
      fontSize:18,  
      fontWeight:'bold',  
      textAlign:'center',  
    },  
    // 内容  
    contentText:{  
      marginLeft:15,  
      fontSize:12,  
      textAlign:'left',  
    },  
    // 按钮  
    buttonView:{  
      alignItems: 'flex-end', 
    },  
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    } 
})
export default Add_assets;