package com.eostoken;

import android.app.Application;

import com.eagle.pay66.Pay66;
import com.eostoken.communication.CommPackage;
import com.facebook.react.ReactApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.lenny.modules.upgrade.UpgradeReactPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import cn.jpush.reactnativejpush.JPushPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.microsoft.codepush.react.CodePush;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.microsoft.codepush.react.CodePush;
import java.util.Arrays;
import java.util.List;
import com.lenny.modules.upgrade.UpgradeReactPackage;
import com.eostoken.umeng.DplusReactPackage;
import com.eostoken.umeng.RNUMConfigure;
import com.theweflex.react.WeChatPackage;
import com.umeng.commonsdk.UMConfigure;
import com.reactnativecomponent.barcode.RCTCapturePackage;

public class MainApplication extends Application implements ReactApplication {

    private static final CommPackage mCommPackage = new CommPackage();

    private ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    mCommPackage,
                    new RCTCapturePackage(),
                    new RNViewShotPackage(),
                    new SvgPackage(),
                    new JPushPackage(!BuildConfig.DEBUG, !BuildConfig.DEBUG),
                    new RNDeviceInfo(),
                    new VectorIconsPackage(),
                    new SplashScreenReactPackage(),
                    new RNGestureHandlerPackage(),
                    new UpgradeReactPackage(),
                    new DplusReactPackage(),
                    new WeChatPackage(),
                    new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG)
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        RNUMConfigure.init(this, "5abddfbab27b0a2e67000060", "Umeng", UMConfigure.DEVICE_TYPE_PHONE,"");
        Pay66.init("9132de465d4e4060ba310f24276a2069", getApplicationContext());
    }

    /**
     * 获取 reactPackage
     * @return
     */
    public static CommPackage getReactPackage() {
        return mCommPackage;
    }
}
