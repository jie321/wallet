import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, ImageBackground, ScrollView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter' 
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
import { EasyToast } from "../../components/Toast"
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";
import moment from 'moment';
var dismissKeyboard = require('dismissKeyboard');
var Dimensions = require('Dimensions')
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
@connect(({ram,sticker,wallet}) => ({...ram, ...sticker, ...wallet}))
class RecordQuery extends React.Component {
  static navigationOptions = {
    title: "搜索交易记录",
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      newramTradeLog: [],
      show: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    EasyLoading.show();
    this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: this.props.navigation.state.params.record}, callback: (resp) => {
      EasyLoading.dismis();
      if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
        this.setState({
          newramTradeLog: [],
          show: true
        })
      }else{
        this.setState({
          newramTradeLog: resp.data,
          show: false,
        })
      }
    }});    
  }

  // 根据账号查找交易记录
  _query = (labelname) =>{
    if (labelname == "") {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      EasyLoading.show();
      this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: labelname.toLowerCase()}, callback: (resp) => {
          if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
            this.setState({
              newramTradeLog: [],
              show: true
            })
          }else{
            this.setState({
                newramTradeLog: resp.data,
                show: false,
            })
          }
          EasyLoading.dismis();
      }});  
    }  
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
      newramTradeLog: []
    });
    this.dismissKeyboardClick();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.header}>  
          <View style={styles.inptout} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                  placeholder="输入EOS账号名" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}   
                  />      
          </View>    
          <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
              <Text style={styles.canceltext}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={styles.canceltext}>清空</Text>
          </TouchableOpacity> 
      </View>   
      {this.state.show && <View style={styles.nothave}><Text style={styles.copytext}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.newramTradeLog == null ? [] : this.state.newramTradeLog)} 
        renderRow={(rowData, sectionID, rowID) => (   
          <View style={styles.package}>
            <View style={styles.leftout}>
              <Text style={styles.payertext}>{rowData.payer}</Text>
              <Text style={styles.timetext}>{moment(rowData.record_date).add(8,'hours').format('MM-DD HH:mm:ss')}</Text>
            </View>
            <View style={styles.rightout}>
              {rowData.action_name == 'sellram' ? 
              <Text style={styles.selltext}>卖 {(rowData.price == null || rowData.price == '0') ? rowData.ram_qty : rowData.eos_qty}</Text>
              :
              <Text style={styles.buytext}>买 {rowData.eos_qty}</Text>
              }
              <Text style={styles.presentprice}>{(rowData.price == null || rowData.price == '0') ? '' : rowData.price}{(rowData.price == null || rowData.price == '0') ? '' :  ' EOS/KB'}</Text>
            </View>
          </View>
        )}                   
      />  
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: UColor.secdColor,
        paddingTop: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 7,
      marginBottom: 5,
      backgroundColor: UColor.mainColor,
    },
    headleftout: {
      paddingLeft: 15
    },
    headleftimg: {
      width: 18,
      height: 18,
      marginRight: 15,
    },
    inptout: {
      flex: 1,
      height: 30,
      borderRadius: 5,
      marginHorizontal: 15,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: UColor.fontColor,
    },
    inpt: {
        flex: 1,
        height: 45,
        fontSize: 14,
        color: '#999999',
    },
    canceltext: {
      color: UColor.fontColor,
      fontSize: 15,
      textAlign: 'center',
      paddingRight: 15,
    },

    btn: {
      flex: 1,
    },
    nothave: {
      height: Platform.OS == 'ios' ? 84.5 : 65,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 5,
      margin: 5,
    },
    copytext: {
      fontSize: 16, 
      color: UColor.fontColor
    },

    package: {
      height: 52,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      marginHorizontal: 10,
      marginVertical: 5,
    },
    leftout: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    payertext: {
      fontSize: 15,
      color: UColor.fontColor,
    },
    timetext: {
      fontSize: 15,
      color: UColor.arrow,
    },
   
    rightout: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    selltext: {
      flex: 5,
      fontSize: 15,
      color: '#F25C49',
      textAlign: 'right',
    },
    buytext: {
      flex: 5,
      fontSize: 15,
      color: "#4ed694",
      textAlign: 'right',
    },
    presentprice: {
      fontSize: 14,
      color: UColor.arrow,
      textAlign: 'right',
    }
});
export default RecordQuery;