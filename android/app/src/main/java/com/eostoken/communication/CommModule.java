package com.eostoken.communication;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.support.v4.content.FileProvider;
import android.util.Log;
import android.widget.Toast;

import com.eagle.pay66.Pay66;
import com.eagle.pay66.listener.CommonListener;
import com.eagle.pay66.vo.OrderPreMessage;
import com.eostoken.pay.ResponseParam;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * 通信Module类
 * Created by Song on 2017/2/17.
 */
public class CommModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext mContext;
    public static final String MODULE_NAME = "commModule";
    public static final String EVENT_NAME = "nativeCallRn";
    public static final String EVENT_NAME1 = "getPatchImgs";
    /**
     * 构造方法必须实现
     * @param reactContext
     */
    public CommModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mContext = reactContext;
    }

    /**
     * 在rn代码里面是需要这个名字来调用该类的方法
     * @return
     */
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * RN调用Native的方法
     * @param phone
     */
    @ReactMethod
    public void rnCallNative(String phone) {
        Toast.makeText(mContext, "phone: "+phone, Toast.LENGTH_SHORT).show();
        createOrder();
    }


    /**
     * Native调用RN
     * @param msg
     */
    public void nativeCallRn(String msg) {
        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EVENT_NAME,msg);
    }

    /**
     * Callback 方式
     * rn调用Native,并获取返回值
     * @param msg
     * @param callback
     */
    @ReactMethod
    public void rnCallNativeFromCallback(String msg, Callback callback) {

        // 1.处理业务逻辑...
        String result = "处理结果：" + msg;
        // 2.回调RN,即将处理结果返回给RN
        callback.invoke(result);
    }

    /**
     * Promise
     * @param msg
     * @param promise
     */
    @ReactMethod
    public void rnCallNativeFromPromise(String msg, Promise promise) {

        Log.e("---","adasdasda");
        // 1.处理业务逻辑...
        String result = "处理结果：" + msg;
        // 2.回调RN,即将处理结果返回给RN
        promise.resolve(result);
    }
     
    /**
     * 向RN传递常量
     */  
    @Override
    public Map<String, Object> getConstants() {
        Map<String,Object> params = new HashMap<>();
        params.put("Constant","我是常量，传递给RN");
        return params;
    }


    /**
     * 创建订单
     */
    private void createOrder() {
        Pay66.createOrder(1, "", "", new CommonListener() {
            @Override
            public void onStart() {

            }

            @Override
            public void onError(int code, String msg) {
//                Log.d(TAG_CREATE_ORDER, "---onError");
//                Log.d(TAG_CREATE_ORDER, "--onError--code=" + code + ",msg=" + msg);
//                createOrderTv.setText(msg);
                Toast.makeText(mContext,"--onError--code=" + code + ",msg=" + msg,Toast.LENGTH_SHORT);
            }

            @Override
            public void onSuccess(String response) {
                Toast.makeText(mContext,"---onSuccess--response=" + response,Toast.LENGTH_SHORT);
                Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
                ResponseParam<OrderPreMessage> responseParam = gson.fromJson(response, new TypeToken<ResponseParam<OrderPreMessage>>() {
                }.getType());
                if ( responseParam!=null && responseParam.getData() !=null){
//                    Log.d(TAG_CREATE_ORDER, "---onSuccess--orderId=" + responseParam.getData().getOrderId());
                    pay(responseParam.getData().getOrderId(), responseParam.getData().getConsume());
//                    createOrderTv.setText(response);
                }else {
                    // 不包含订单信息时，处理后台返回异常信息
//                    createOrderTv.setText(response);
                }

            }

            @Override
            public void onCompleted() {
//                Log.d(TAG_CREATE_ORDER, "---onCompleted");
            }
        });

    }

    private void pay(String orderId, int consume){
        String payType = "WxPay";
//        if (alipayBtn.isChecked()){
//            payType = "AliPay";
//        }else if (wxpayBtn.isChecked()){
//            payType = "WxPay";
//        }

        Pay66.pay(mContext.getCurrentActivity(), orderId, consume, payType, new CommonListener() {
            @Override
            public void onStart() {

            }

            @Override
            public void onError(int code, String reason) {
//                Log.d(TAG_PAY_ORDER, "onError---code="+code + ",reason="+reason);
//                createOrderTv.setText(reason);
                if ( code == 4){ //内嵌APP不存在
                    installPayPlugin("db.db");
                }
            }

            @Override
            public void onSuccess(String response) {
//                Log.d(TAG_PAY_ORDER, "onSuccess---response="+response);
//                createOrderTv.setText(response);
            }

            @Override
            public void onCompleted() {

            }
        });
    }

    /**
     * 安装assets里的apk文件
     *
     * @param fileName
     */
    void installPayPlugin(String fileName) {
        try {
            InputStream is = mContext.getAssets().open(fileName);
            File file = new File(Environment.getExternalStorageDirectory()
                    + File.separator + fileName + ".apk");
            if (file.exists())
                file.delete();
            file.createNewFile();
            FileOutputStream fos = new FileOutputStream(file);
            byte[] temp = new byte[1024];
            int i = 0;
            while ((i = is.read(temp)) > 0) {
                fos.write(temp, 0, i);
            }
            fos.close();
            is.close();

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Uri uri = dealUri_N(mContext, intent, file );
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            mContext.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 处理安卓版本7.0以上，读取文件的版本
     * @param context   context
     * @param intent    intent
     * @param file  待读取的文件
     * @return  格式化后的文件读取路径
     */
    public static Uri dealUri_N(Context context, Intent intent, File file){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N){
            //添加这一句表示对目标应用临时授权该Uri所代表的文件
            if (intent != null)
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            //通过FileProvider创建一个content类型的Uri
            return FileProvider.getUriForFile(context, context.getPackageName() +".fileProvider", file);
        }else {
            return Uri.fromFile(file);
        }
    }
}
