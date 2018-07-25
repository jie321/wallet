import React from 'react';
import { connect } from 'react-redux'
import {ListView,StyleSheet,Image,ScrollView,View,Text, TextInput,Platform,TouchableOpacity,KeyboardAvoidingView  } from 'react-native';
import UColor from '../../utils/Colors'
import UImage from '../../utils/Img'
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import {NavigationActions} from 'react-navigation'
var dismissKeyboard = require('dismissKeyboard');

@connect(({assets}) => ({...assets}))
class MortgageInquiry extends BaseComponent {

  static navigationOptions = {
    header:null,  //隐藏顶部导航栏
  };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ search: this._leftTopClick, cancel:this._rightTopClick  });
    this.state = {
        dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
        labelname: '',
        Mortgagelist: [],
        newMortgagelist: [],
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'vote/getMortgagelist', payload: {account_name: this.props.navigation.state.params.account_name},
    callback: (Mortgage) => {
        this.setState({
            Mortgagelist: Mortgage.data.rows,
        })
      }
    });
  }

  _rightTopClick =() => {
    this.pop(1, true);
  }

  pop(nPage, immediate) {
    const action = NavigationActions.pop({
        n: nPage,
        immediate: immediate,
    });
    this.props.navigation.dispatch(action);
  }

  _leftTopClick =() => {
    if (this.state.labelname == "") {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      let NumberArr = this.state.Mortgagelist
      for (var i = 0; i < NumberArr.length; i++) {
        if (NumberArr[i].to == this.state.labelname) {
          this.setState({
            newMortgagelist:[NumberArr[i]],
          });
        }
      }
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (<View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
        <ScrollView keyboardShouldPersistTaps="always">
          <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
              <View style={styles.header}>  
                  <TouchableOpacity onPress={this._leftTopClick.bind()}>  
                      <View style={styles.headleftout} >
                          <Image source={UImage.Magnifier} style={styles.headleftimg}></Image>
                      </View>
                  </TouchableOpacity>  
                  <View style={styles.inptout} >
                      <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                          selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                          placeholder="输入Eos账号/查询他人抵押信息" underlineColorAndroid="transparent" keyboardType="default"
                          onChangeText={(labelname) => this.setState({ labelname })}
                          />      
                  </View>     
                  <TouchableOpacity   onPress={this._rightTopClick.bind()}>  
                      <Text style={styles.canceltext}>取消</Text>
                  </TouchableOpacity>  
              </View> 
              <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
                  dataSource={this.state.dataSource.cloneWithRows(this.state.newMortgagelist == null ? [] : this.state.newMortgagelist)} 
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
              )}/>  
            </TouchableOpacity>
          </ScrollView> 
      </KeyboardAvoidingView>  
    </View>)
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: UColor.secdColor,
    paddingTop: 5
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop:Platform.OS == 'ios' ? 30 : 20,
    paddingBottom: 5,
    backgroundColor: UColor.mainColor,
  },
  headleftout: {
    paddingLeft: 15
  },
  headleftimg: {
    width: 30,
    height: 30
  },
  inptout: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center', 
  },
  inpt: {
      color: '#999999',
      fontSize: 14,
      height: 30,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor: UColor.fontColor,
      paddingVertical: 0,
  },
  canceltext: {
    color: UColor.arrow,
    fontSize: 18,
    justifyContent: 'flex-end',
    paddingRight: 15
  },
  btn: {
    flex: 1,
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
})
export default MortgageInquiry;