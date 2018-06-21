import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, Switch } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import JPush from 'jpush-react-native';
var DeviceInfo = require('react-native-device-info');
export var jpushSwitch = false;
import JPushModule from 'jpush-react-native';
const Font = {
  Ionicons,
  FontAwesome
}
@connect(({ login,jPush }) => ({ ...login,...JPush }))
class Helpcenter extends React.Component {

  static navigationOptions = {
    title: '帮助中心',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: "#586888",
    },
  };
  

  constructor(props) {
    super(props);
    this.state = {
      value: false,
      disabled: false,
    }
    
    this.config = [
      { first: true, name: "什么是钱包？", onPress: this.goPage.bind(this, "wallet") },
      { name: "什么是私钥？", onPress: this.goPage.bind(this, "ks") },
      { name: "什么是助记词？", onPress: this.goPage.bind(this, "mw") },
      { first: true, name: "如何导入EOS钱包？", onPress: this.goPage.bind(this, "iw") },
      { name: "如何添加钱包？", onPress: this.goPage.bind(this, "atw") },
      { name: "如何备份钱包？", onPress: this.goPage.bind(this, "bw") },
      { name: "如何转账？", onPress: this.goPage.bind(this, "ta") },
      { name: "EOS超级代理投票说明", onPress: this.goPage.bind(this, "vote") },
    ];

    
  }

    //组件加载完成
    componentDidMount() {
      const {dispatch}=this.props;
      dispatch({type:'login/getJpush',callback:(jpush)=>{
        this.setState({
          value:jpush.jpush,
        });
      }});
    }

    changeJpush(state){
      const {dispatch}=this.props;
      dispatch({type:'login/changeJpush',callback:(jpush)=>{
        this.setState({
          value:jpush,
        });
      }});
      if(state){
        JPushModule.addTags(['newsmorningbook'], map => {
        })
      }else{
        JPushModule.deleteTags(['newsmorningbook'], map => {
        });
      }
    }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "wallet") {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Wallet.html" });
    } else if (key == 'ks') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Keystore.html" });
    } else if (key == 'mw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/MemorizingWords.html" });
    } else if (key == 'iw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/ImportWallet.html" });
    }else if (key == 'atw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/AddToWallet.html" });
    }else if (key == 'bw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/BackupsWallet.html" });
    }else if (key == 'ta') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/TransferAccounts.html" });
    }else if (key == 'vote') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/VoteCourse.html" });
    }else if (key == 'pf'){
      navigate('ProblemFeedback', {});
    }else{
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }
  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  render() {
    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
          <View>
            {this._renderListItem()}
          </View>
          <Button onPress={this.goPage.bind(this, 'pf')}>
            <View style={styles.listItem}>
                <View style={styles.listInfo}>
                  <View style={{flex: 1}}><Text style={{color:UColor.tintColor, fontSize:16}}>问题反馈</Text></View>
                  <View style={styles.listInfoRight}>            
                    <Font.Ionicons style={{marginLeft: 10}} name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
                  </View>
                </View>
              </View>
          </Button>
        </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: UColor.secdColor,
    },
    listItem: {
      height: 56,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 15
    },
    listInfo: {
      height: 56,
      flex: 1,
      paddingLeft: 16,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center"
    }
});

export default Helpcenter;