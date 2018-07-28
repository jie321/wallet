import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard, ImageBackground, ScrollView } from 'react-native';
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
var Dimensions = require('Dimensions')
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
@connect(({ vote }) => ({ ...vote}))
class MortgageRecord extends React.Component {

  static navigationOptions = ({ navigation }) => {
    
    const params = navigation.state.params || {};
   
    return {    
      title: "抵押记录",
      headerStyle: {
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
      },
      headerRight: (<Button onPress={navigation.state.params.onPress}>
        <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>查询</Text>
      </Button>),            
    };
  };

  inquiryMortgage = () =>{  
    const { navigate } = this.props.navigation;
    navigate('MortgageInquiry', {account_name:this.props.navigation.state.params.account_name});
  }  

  constructor(props) {
    super(props);
    this.props.navigation.setParams({ onPress: this.inquiryMortgage});
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      delegateLoglist: [],
      show: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    EasyLoading.show();
      this.props.dispatch({
        type: 'vote/getDelegateLoglist',
        payload: {account_name: this.props.navigation.state.params.account_name},
        callback: (resp) => {
          if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
            this.setState({show: true, delegateLoglist: []});
          }else{
            this.setState({show: false, delegateLoglist: resp.data.rows});
          }
          EasyLoading.dismis();
        }
    });
  }

  render() {
    return (<View style={styles.container}>
       {this.props.show && <View style={styles.nothave}><Text style={styles.copytext}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.delegateLoglist == null ? [] : this.state.delegateLoglist)} 
        renderRow={(rowData, sectionID, rowID) => (   
              <View style={styles.outsource}>
                <View style={styles.leftout}>
                    <Text style={styles.fromtotext}>{rowData.from}</Text>
                    <Text style={styles.payernet}>Payer</Text>
                    <Text style={styles.fromtotext}>{rowData.to}</Text>
                    <Text style={styles.Receivercpu}>Receiver</Text>
                </View>
                <View style={styles.rightout}>
                    <Text style={styles.fromtotext}>{rowData.net_weight}</Text>
                    <Text style={styles.payernet}>Net bandwidth</Text>
                    <Text style={styles.fromtotext}>{rowData.cpu_weight}</Text>
                    <Text style={styles.Receivercpu}>CPU bandwidth</Text>
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
        paddingTop: 5
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
    outsource: {
      margin: 5,
      height: 110,
      borderRadius: 5,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      backgroundColor: UColor.mainColor,
    },
    leftout:{
      flex: 1, alignItems: "flex-start",
    },
    rightout: {
      flex: 1, alignItems: "flex-end", 
    },
    fromtotext: {
        fontSize: 12,
        color: UColor.fontColor,
        lineHeight: 20,
      },
      payernet: {
        fontSize: 12,
        color: UColor.arrow,
        marginBottom: 10,
      },
      Receivercpu: {
        fontSize: 12,
        color: UColor.arrow,
        lineHeight: 20,
      },
});
export default MortgageRecord;