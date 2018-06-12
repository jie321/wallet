import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity,ImageBackground} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import {EasyDialog} from '../../components/Dialog'
import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet}) => ({...wallet}))
class AgentInfo extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "代理人信息",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },
        };
      };

    constructor(props) {
        super(props);
        this.state = {
            isAllSelected: true,  
            isNotDealSelected: false,        
        };
    }
  
 
    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: this.props.navigation.state.params.coins.name, url: this.props.navigation.state.params.coins.url });
      }
   


    render() {
        const agent = this.props.navigation.state.params.coins;
        return (
            <View style={styles.container}> 
                <ScrollView>
                    <View style={{paddingLeft: 5, paddingRight: 5,  paddingBottom: 10, backgroundColor: '#43536D'}}>
                        <ImageBackground style={{ justifyContent: "center", alignItems: 'center', height:118, flexDirection:'column', marginTop: 3, marginBottom: 4, }} source={UImage.AgentInfo_bg} resizeMode="stretch">                  
                            <View style={{width: 50, height: 50, backgroundColor: '#586888',justifyContent: "center", alignItems: 'center', borderRadius: 25, margin: 5,}}>
                                <Image style={{width: 33, height: 33,}} source={{uri: agent.icon}}/>
                            </View>
                            <Text style={{width: 117, height: 24, lineHeight: 24, backgroundColor: '#65CAFF', textAlign: 'center', color: '#FFFFFF', borderRadius: 5,  }}>{agent.name}</Text>           
                        </ImageBackground> 
                        <View style={{padding: 5, backgroundColor: '#586888', borderRadius: 5,}}>
                            {/* <Image style={{width: 35, height: 26, position: 'absolute', top: 0, left: 15, zIndex: 999}} source={UImage.AgentInfo_bg}/> */}
                            <View style={{flexDirection: "row", }}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.region}</Text>
                                    <Text style={styles.state}>地区</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{parseInt(agent.total_votes)}</Text>
                                    <Text style={styles.state}>得票总数</Text>
                                </View>
                            </View>   
                            <View style={{flexDirection: "row", }}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.ranking}</Text>
                                    <Text style={styles.state}>排名</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.number}> </Text>
                                    <Text style={styles.state}>出块状态</Text>
                                </View>
                            </View> 
                            <View style={{ height:35, flexDirection: "row", justifyContent: 'flex-start', alignItems: 'center'}}>
                                <Text style={{ fontSize: 12, color: '#8696B0', marginTop: 5 }}>官网：</Text>
                                <Text onPress={() => this.prot()} style={{ fontSize: 13, color: '#65CAFF', marginTop: 5 }}>{agent.url}</Text>
                            </View>
                        </View>
                    </View> 
                    <View style={{flex: 1,  backgroundColor: '#FFFFFF', paddingTop: 5, paddingLeft: 35, paddingRight: 35,}}>  
                        <View style={{paddingBottom: 25,}}>
                            <Text style={styles.text}>{agent.introduce}</Text>
                        </View>
                    </View>
                </ScrollView>        
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },

    frame: {
        flex: 1,
        height: 60,
        margin: 2, 
        padding:5,
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#61708E',
        // borderBottomColor: '#586888', 
        // borderBottomWidth: 1,
    },

    number: {
        fontSize: 18, 
        color: '#FFFFFF',   
    },

    state: {  
        fontSize: 12, 
        color: '#8696B0', 
    },

    tablayout: {   
        flexDirection: 'row',  
    },  

    buttontab: {  
        margin: 5,
        width: 100,
        height: 33,
        borderRadius: 15,
        alignItems: 'center',   
        justifyContent: 'center', 
    },  

    text: {  
       fontSize: 12,
       color: '#010101',
       lineHeight: 20,
    },  

    
});

export default AgentInfo;
