import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class ModifyPassword extends React.Component {

    static navigationOptions = {
        title: '更改密码',
        headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            newPassword: "",
            newRePassword: "",
        }
    }

    updatePassword = () => {

        if (this.setState.password == "") {
            EasyToast.show('请输入旧密码');
            return;
        }
        if (this.setState.newPassword == "") {
            EasyToast.show('请输入新密码');
            return;
        }
        if (this.setState.newRePassword == "") {
            EasyToast.show('请输入确认密码');
            return;
        }
        if (this.setState.newRePassword != this.setState.newPassword) {
            EasyToast.show('两次密码不一致');
            return;
        }
        var wallet = this.props.navigation.state.params;
        try {
            var ownerPrivateKey = wallet.ownerPrivate;
            var bytes_ownerPrivate = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + wallet.salt);
            var plaintext_ownerPrivate = bytes_ownerPrivate.toString(CryptoJS.enc.Utf8);

            if (plaintext_ownerPrivate.indexOf('eostoken') != - 1) {
                // plaintext_ownerPrivate = plaintext_ownerPrivate.substr(8, plaintext_ownerPrivate.length);

                //**************解密********* */
                var activePrivate = "";
                var plaintext_activePrivate = "";
                var _activePrivate = "";

                if (this.props.navigation.state.params.activePrivate != null) {
                    activePrivate = this.props.navigation.state.params.activePrivate;
                    var bytes_activePrivate = CryptoJS.AES.decrypt(activePrivate.toString(), this.state.password + this.props.navigation.state.params.salt);
                    plaintext_activePrivate = bytes_activePrivate.toString(CryptoJS.enc.Utf8);
                    _activePrivate = CryptoJS.AES.encrypt(plaintext_activePrivate, this.state.newPassword + this.props.navigation.state.params.salt);
                }

                var words = "";
                var plaintext_words = "";
                var _words = "";

                if (wallet.words != null) {
                    words = this.props.navigation.state.params.words;
                    var bytes_words = CryptoJS.AES.decrypt(words.toString(), this.state.password + wallet.salt);
                    plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
                    _words = CryptoJS.AES.encrypt(plaintext_words, this.state.newPassword + wallet.salt);
                }

                var words_active = "";
                var plaintext_words_active = "";
                var _words_active = "";

                if (wallet.words_active != null) {
                    words_active = this.props.navigation.state.params.words_active;
                    var bytes_words_active = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + wallet.salt);
                    plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
                    _words_active = CryptoJS.AES.encrypt(plaintext_words_active, this.state.newPassword + wallet.salt);
                }
                //**************加密********* */
                var _ownerPrivate = CryptoJS.AES.encrypt(plaintext_ownerPrivate, this.state.newPassword + wallet.salt);

                var _wallet = {
                    name: wallet.name,
                    account: wallet.account,
                    ownerPublic: wallet.ownerPublic,
                    activePublic: wallet.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isBackups: wallet.isBackups
                }
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/modifyPassword', payload: { _wallet } });

                DeviceEventEmitter.addListener('modify_password', (data) => {
                    EasyToast.show('密码修改成功');
                    this.props.navigation.goBack();
                });
            } else {
                EasyToast.show('旧密码不正确');
            }
        } catch (error) {
            EasyToast.show('旧密码不正确');
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return <View style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <View style={styles.outsource}>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.password} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                secureTextEntry={true} placeholder="当前密码"  underlineColorAndroid="transparent" autoFocus={false}
                                editable={true} onChangeText={(password) => this.setState({ password })}  
                            />
                        </View>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} value={this.state.newPassword} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                secureTextEntry={true}  placeholder="新密码" underlineColorAndroid="transparent"  autoFocus={false} 
                                editable={true} onChangeText={(newPassword) => this.setState({ newPassword })} 
                            />
                        </View>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} returnKeyType="next"
                                value={this.state.newRePassword} onChangeText={(newRePassword) => this.setState({ newRePassword })}
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} 
                            />
                        </View>
                        <View style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} returnKeyType="next" 
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                placeholder="密码提示(可不填)" underlineColorAndroid="transparent" 
                            />
                        </View>
                    </View>
                    {/* <Text style={styles.welcome}>忘记密码？导入助记词或私钥可重置密码。马上导入</Text> */}
                    <Button onPress={() => this.updatePassword()}>
                        <View style={styles.btnout}>
                            <Text style={styles.buttext}>确认</Text>
                        </View>
                    </Button>
                </KeyboardAvoidingView>
            </TouchableOpacity>
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

    outsource: {
        backgroundColor: UColor.mainColor, 
        marginTop: 30, 
        paddingBottom: 5,
    },
    inptoutsource: {
        paddingTop: 10, 
        paddingHorizontal: 20, 
        borderBottomColor: UColor.secdColor, 
        borderBottomWidth: 1,
    },
    inpt: {
        color: UColor.arrow, 
        fontSize: 15, 
        height: 50,
    },

    welcome: {
        color: UColor.arrow, 
        marginBottom: 10, 
        marginLeft: 10
    },

    btnout: {
        height: 45, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 40, 
        marginHorizontal:30,  
        borderRadius: 5
    },
    buttext: {
        fontSize: 15, 
        color: UColor.fontColor
    },
});

export default ModifyPassword;
