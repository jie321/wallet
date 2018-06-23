import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Ionicons from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import store from 'react-native-simple-store';

let timer;

@connect(({ wallet }) => ({ ...wallet }))
class WalletManage extends React.Component {

  static navigationOptions = {
    headerTitle:'钱包管理',
    headerStyle:{
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
    },  
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    }
    DeviceEventEmitter.addListener('modify_password', () => {
        this.props.dispatch({ type: 'wallet/walletList' });
    });
  }

  //组件加载完成
  componentDidMount() {
    const { dispatch } = this.props;
    var th = this;
    this.props.dispatch({ type: 'wallet/walletList' });
    DeviceEventEmitter.addListener('updateDefaultWallet', (tab) => {
        this.props.dispatch({ type: 'wallet/walletList' });
      });
    DeviceEventEmitter.addListener('delete_wallet', (tab) => {
      this.props.dispatch({ type: 'wallet/walletList' });
    });
  }

  onPress = (data, sectionID, rowID) => {
    const { navigate } = this.props.navigation;
    var func = this.updateState;
    navigate('WalletDetail', { data, func });
  }

  createWallet() {
    // 创建钱包
    // const { navigate } = this.props.navigation;
    // navigate('CreateWallet', {});
    EasyToast.show('敬请期待');
  }
  
  importWallet() {
    // 导入钱包
    const { navigate } = this.props.navigation;
    navigate('ImportEosKey');
    // EasyToast.show('测试网络暂不开放');
  }

  updateState(state) {
    alert(state);
  }

  render() {
    const v = (
    <View style={styles.container}>  
      <View>
        <ListView initialListSize={10} style={{ backgroundColor: UColor.secdColor }} enableEmptySections={true}
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
          refreshControl={<RefreshControl refreshing={false} tintColor={UColor.fontColor} colors={['#ddd', UColor.tintColor]} progressBackgroundColor={UColor.fontColor} />}
          dataSource={this.state.dataSource.cloneWithRows(this.props.coinList == null ? [] : this.props.coinList)}
          renderRow={(rowData, sectionID, rowID) => (
            <Button onPress={this.onPress.bind(this, rowData, sectionID, rowID)}>
              <View style={styles.row} >  
                  <View style={styles.top}>
                      <View style={styles.topout}>
                          <Text style={styles.outname}>{rowData.name}</Text>
                          {rowData.isBackups ? <Text style={styles.stopoutBackups}>已备份</Text> : <Text style={styles.notoutBackups}>未备份</Text> }   
                      </View>
                      <View style={styles.topout}>               
                          <Text style={styles.outaccount} numberOfLines={1} ellipsizeMode='middle'>{rowData.account}</Text>
                          <Ionicons style={styles.outIon} name="ios-arrow-forward-outline" size={20} />     
                      </View>
                  </View>                       
                  <View style={styles.balanceout}>
                      <Text style={styles.balance}></Text>
                      <Text style={styles.balancetext}></Text>                           
                  </View>
              </View>
            </Button>          
          )}
        /> 
      </View> 
      <View style={styles.footer}>
          <Button  onPress={() => this.createWallet()} style={{flex:1}}>
              <View  style={styles.footoutsource}>
                  <Image source={UImage.xin1} style={styles.footimg}/>
                  <Text style={styles.footText}>创建钱包</Text>
              </View>
          </Button>
          <Button  onPress={this.importWallet.bind(this)} style={{flex:1}}>
              <View style={styles.footoutsource}>
                  <Image source={UImage.xin0} style={styles.footimg}/>
                  <Text style={styles.footText}>导入钱包</Text>
              </View>
          </Button>
      </View> 
    </View>   
    );
   
    return (v);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  row:{
    height:110,
    backgroundColor:UColor.mainColor,
    flexDirection:"column",
    paddingTop:10,
    paddingHorizontal: 20,
    justifyContent:"space-between",
    borderRadius:5,
    margin:10,
  },
  top:{
      flex:2,
      flexDirection:"column",
  },
  topout: {
      flexDirection: "row",
      flex: 1,
  },
  outname: {
    fontSize: 14,
    color: UColor.fontColor,
    textAlign: 'left',
    marginRight: 10,
  },
  stopoutBackups: {
    height: 18,
    lineHeight: 18,
    fontSize: 10,
    color: '#2ACFFF',
    textAlign: 'left',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ACFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  notoutBackups: {
    height: 18,
    lineHeight: 18,
    fontSize: 10,
    color: UColor.arrow,
    textAlign: 'left',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UColor.arrow,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
  outaccount: {
    flex: 1,
    fontSize: 14,
    color: UColor.arrow,
    textAlign: 'left',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outIon: {
    flex: 1,
    color: UColor.fontColor,
    textAlign: 'right',
    justifyContent: 'center',
    alignItems: 'center',
  },



  balanceout: {
    flexDirection: "row",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  balance: {
    fontSize:20, 
    color:"#EFEFEF",
  },
  balancetext: {
    fontSize:16, 
    color: UColor.arrow,
  },

  footer:{
      paddingTop:5,
      height:60,    
      flexDirection:'row',  
      position:'absolute',
      backgroundColor:UColor.secdColor,
      bottom: 0,
      left: 0,
      right: 0,
  },
  footoutsource:{
      flex:1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection:'row',
      marginRight:1,
      backgroundColor:UColor.mainColor,
  },
  footimg: {
      width:30,
      height:30,
  },
  footText:{
      marginLeft:20,
      fontSize:18,
      color:UColor.fontColor
  },
});

export default WalletManage;
