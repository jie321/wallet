import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';

@connect(({vote}) => ({...vote}))
class Imvote extends React.Component {
 
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "我的投票",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: "#586888",
          },      
        };
      };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            show: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    componentDidMount() {
        this.props.dispatch({ type: 'vote/list', payload: { page:1} });
    }

    deleteItem = () => { // 删除
        let {selectMap} = this.state;
        let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        // alert("确认撤票" + valueArr)
    };


    selectItem = (item) => { // 单选
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }


    render() {
        return (
            <View style={styles.container}>
                 <View style={{flexDirection: 'row', backgroundColor: '#586888',}}>         
                    <Text style={{ width:100, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>排名/用户</Text>           
                    <Text style={{flex:1, color:'#FFFFFF', fontSize:16, textAlign:'center',  lineHeight:25,}}>票数（EOS）</Text>           
                    <Text style={{width:60, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>选择</Text>          
                </View>
                <ListView style={{flex:1,}} renderRow={this.renderRow} enableEmptySections={true} 
               
                dataSource={this.state.dataSource.cloneWithRows(this.props.voteData == null ? [] : this.props.voteData)} 
                //dataSource={this.state.dataSource.cloneWithRows(list.data == null ? [] : JSON.parse(list.data).rows)} 
                renderRow={(rowData, sectionID, rowID) => ( // cell样式                 
                        <View style={{flexDirection: 'row', height: 40,}} backgroundColor={rowID%2 ==0?"#43536D":" #4E5E7B"}>
                            <View style={{ width:120, justifyContent: 'center', alignItems: 'flex-start', }}>
                                <Text style={{ paddingLeft:5, color:'#FFFFFF', fontSize:16,}} >{rowData.owner}</Text>
                            </View>
                            <View style={{flex:1,justifyContent: 'center', alignItems: 'flex-end', }}>
                                <Text style={{ color:'#FFFFFF', fontSize:16,}}>{parseInt(rowData.total_votes)}</Text>
                            </View>
                            <TouchableOpacity style={{width:50,justifyContent: 'center', alignItems: 'center',}} onPress={ () => this.selectItem(rowData)}>
                                <View style={{width: 27, height: 27, margin:5, borderColor:'#586888',borderWidth:2,}} >
                                    <Image source={rowData.isChecked ? UImage.Tick:null} style={{ width: 25, height: 25 }} />
                                </View>  
                            </TouchableOpacity>                         
                        </View>
                    )}                   
                />               
                <View style={styles.footer}>
                    <Button  style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Text style={{ marginLeft: 20, fontSize: 18, color: '#F3F4F4' }}>123465</Text>
                            <Text style={{ marginLeft: 20, fontSize: 14, color: '#8696B0' }}>剩余可投票数</Text>
                        </View>
                    </Button>
                    <Button onPress={this.deleteItem.bind(this)} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginLeft: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.vote_h} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>撤票</Text>
                        </View>
                    </Button>
                </View>  
            </View>
        );
    }

     //渲染页面
    // render() {
    //     const v = (
    //     <ListView
    //         renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
    //         style={{ backgroundColor: UColor.secdColor }}
    //         enableEmptySections={true}
    //         onEndReachedThreshold={20}
    //         dataSource={this.state.dataSource.cloneWithRows(this.props.voteData.rows == null ? [] : JSON.parse(this.props.voteData).rows)}
    //         renderRow={(rowData) => (
    //             <View>asdfasdf</View>
    //         )}
    //     />
    //     );
    //     return (v);
    // }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
    },
    footer: {
      height: 60,
      flexDirection: 'row',
      backgroundColor: '#43536D',  
    },

});

export default Imvote;
