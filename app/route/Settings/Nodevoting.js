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
var collectionArray = [
    {collectItem1: "1.fbfdgdgdfds",collectItem2: "9999999999999999"},
    {collectItem1: "2.fbfdgdgdhkh",collectItem2: "999999999999999"},
    {collectItem1: "3.dgdgdsfjghj",collectItem2: "88888888888888"},
    {collectItem1: "4.dgdgdsfjghj",collectItem2: "8888888888888"},
    {collectItem1: "5.gsdfgdfsgjg",collectItem2: "777777777777"},
    {collectItem1: "6.gsdfgdfsgwe",collectItem2: "77777777777"},
    {collectItem1: "7.gdfgdfgdfgq",collectItem2: "6666666666"},
    {collectItem1: "8.gdfgdfgdfgu",collectItem2: "666666666"},
    {collectItem1: "9.gdgfbvxcvxc",collectItem2: "55555555"},
    // {collectItem1: "10.gdgfbvxcvx",collectItem2: "5555555"},
    // {collectItem1: "11.sfdsfewfxc",collectItem2: "444444"},
    // {collectItem1: "12.sfdsfewfxc",collectItem2: "44444"},
    // {collectItem1: "13.xcvgfbsvsd",collectItem2: "3333"},
    // {collectItem1: "14.xcvgfbsvsd",collectItem2: "333"},
    // {collectItem1: "15.gbhxvsdvsz",collectItem2: "22"},
    // {collectItem1: "16.gbhxvsdvse",collectItem2: "2"},
    // {collectItem1: "17.vdfbvdvdsh",collectItem2: "1"},
    // {collectItem1: "18.vdfbvdvdsb",collectItem2: "0"},
];

@connect(({vote}) => ({...vote}))
class Nodevoting extends React.Component {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "投票",
          headerStyle: {
            paddingTop:20,
            backgroundColor: "#586888",
          },
          headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ padding: 15 }}>
                <Image source={UImage.Magnifier} style={{ width: 30, height: 30 }}></Image>
            </View>
          </Button>),            
        };
      };

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
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

    _rightButtonClick() {
        this._setModalVisible();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    deleteItem = () => { // 删除
        this._setModalVisible();
        let {selectMap} = this.state;
        let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        alert("投票成功" + valueArr)
    };


    selectItem = (item) => { 
        this.props.dispatch({ type: 'vote/up', payload: { item:item} });
    }


    render() {
        return (
            <View style={styles.container}>
                 <View style={{flexDirection: 'row', backgroundColor: '#586888',}}>         
                    <Text style={{ width:100, paddingLeft:20, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>排名/用户</Text>           
                    <Text style={{flex:1, color:'#FFFFFF', fontSize:16, textAlign:'center',  lineHeight:25,}}>票数（EOS）</Text>           
                    <Text style={{width:60, color:'#FFFFFF', fontSize:16,  textAlign:'center', lineHeight:25,}}>选择</Text>          
                </View>
                <ListView style={{flex:1,}} renderRow={this.renderRow} enableEmptySections={true} 
               
                dataSource={this.state.dataSource.cloneWithRows(this.props.voteData == null ? [] : this.props.voteData)} 
                //dataSource={this.state.dataSource.cloneWithRows(list.data == null ? [] : JSON.parse(list.data).rows)} 
                renderRow={(rowData, sectionID, rowID) => ( // cell样式                 
                        <View style={{flexDirection: 'row', height: 40,}} backgroundColor={rowID%2 ==0?"#43536D":" #4E5E7B"}>
                            <View style={{ width:100, justifyContent: 'center', alignItems: 'flex-start', }}>
                                <Text style={{ paddingLeft:20, color:'#FFFFFF', fontSize:16,}} numberOfLines={1}>{rowData.owner}</Text>
                            </View>
                            <View style={{flex:1,justifyContent: 'center', alignItems: 'flex-start', }}>
                                <Text style={{ paddingLeft:30, color:'#FFFFFF', fontSize:16,}}>{parseInt(rowData.total_votes)}</Text>
                            </View>
                            <TouchableOpacity style={{width:60,justifyContent: 'center', alignItems: 'center',}} onPress={ () => this.selectItem(rowData)}>
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
                            <Image source={UImage.vote} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>投票</Text>
                        </View>
                    </Button>
                </View>  
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
    footer: {
      height: 60,
      flexDirection: 'row',
      backgroundColor: '#43536D',
    },
    pupuo: {
      // flex:1,  
      backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        // backgroundColor:'#ccc',  
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    // modal上子View的样式  
    subView: {
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    // 标题  
    titleText: {
        marginBottom: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        flex:1,
        paddingTop: 5,
        fontSize: 16,
        textAlign: 'left',    
        lineHeight:30,
    },
    
    });

export default Nodevoting;
