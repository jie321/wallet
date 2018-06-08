import Constants from '../utils/Constants'
// const request = (url, method, body) => {
//   let isOk;
//   return new Promise((resolve, reject) => {
//     fetch(url, {
//       method,
//       headers: {
//         'Content-Type': 'application/json;charset=utf-8',
//         "uid":Constants.uid|'',
//         "token":Constants.token,
//         "version":Constants.version,
//         "os":Constants.os,
//         "osVersion":Constants.osVersion,
//         "model":Constants.model,
//         "deviceId":Constants.deviceId
//       },
//       body:JSON.stringify(body)
//     })
//       .then((response) => {
//         if (response.ok) {
//           isOk = true;
//         } else {
//           isOk = false;
//         }
//         return response.json();
//       })
//       .then((responseData) => {
//         if (isOk) {
//           resolve(responseData);
//         } else {
//           reject(responseData);
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };

const requestO = (url,method, body) => {
  let timeout=10000
  const request1 = new Promise((resolve, reject) => {
    fetch(url,{
        method: method,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          "uid":Constants.uid|'',
          "token":Constants.token,
          "version":Constants.version,
          "os":Constants.os,
          "osVersion":Constants.osVersion,
          "model":Constants.model,
          "deviceId":Constants.deviceId
        },
        body:JSON.stringify(body)
    })
    // 请求状态成功，解析请求数据
    .then(res => {
      if (res.status >= 200 && res.status < 300) {
        //resolve(res);
        resolve(res.json())
      }
      reject(`${res.status}`);
    })
    // 返回请求的数据
    .then(responseJson=>{
      resolve(responseJson)
    })
    // 返回错误
    .catch(e => reject(e.message));
  });

// 定义一个延时函数
  const timeoutRequest = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'Request timed out');
  });

// 竞时函数，谁先完成调用谁
  return Promise
    .race([request1, timeoutRequest])
    .then(res => {
      return res
    }, m => {
      throw new Error(m);
    });
};

const request = (url,method,body)=>{
   return getRootaddr().then(res=>{
      let okUrl = url
      let rootaddr = res
      console.info("BBBBBBBBBBBBBB", rootaddr)
      if(okUrl.indexOf("/")==0){
        okUrl = rootaddr+url
      }
      
      return requestO(okUrl, method, body)
   }).catch(e=>{
    console.log(e);
   })
};

const getRootaddr = ()=>{
  return requestO(Constants.gateurl, 'post',{})
    .then(res => {
      Constants.rootaddr = res.url
      return Constants.rootaddr;
    })
    .catch(e=>{
      console.log(e);
    })
}

export default {
  request,
  requestO,
  getRootaddr
};
