import { webConf } from "@core/const/api";
import { getCurrentTime } from "./common";
import { encryption_By_Aes_CBC_192 } from "./rsa";
import CryptoJS from 'crypto-js';
import {JSEncrypt2} from './ras-public-decrypt';
import service from "./service";

function getRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

const SendPost = (data: any, RSA = false) => {
    //加入公共参数,status 和现行时间戳
    let Status = 10000;
    let Time = getCurrentTime(); //发包时间
    let postData = data
    postData.Time = Time
    postData.Status = Status


    if (localStorage.getItem("集_验证码值") !== "" && localStorage.getItem("集_验证码ID") !== "") {
        // 验证码id可能会缓存.所以必须是有验证码置时才携带 ,并清除缓存
        let Captcha: any = {}
        Captcha.Id = localStorage.getItem("集_验证码ID")
        Captcha.Type = parseInt(localStorage.getItem("集_验证码类型") as any)
        Captcha.Value = localStorage.getItem("集_验证码值")
        postData.Captcha = Captcha
        localStorage.setItem("集_验证码ID", "")
        localStorage.setItem("集_验证码类型", "0")
        localStorage.setItem("集_验证码值", "")
    }

    //判断加密方式 对明文处理
    if (webConf.CryptoType === 1) {
        //明文不处理
    }
    if (webConf.CryptoType === 2 || (webConf.CryptoType === 3 && !RSA)) { //加密类型为2 或 加密类型为3但不强制Rsa加密的
        let 密文对象 = {a: "", b: ""}
        //Aes加密并签名
        //如果加密类型为2  就是用配置的密钥,如果加密类型为3 就是用GetToken接口返回的密钥
        let aesKey: any = webConf.CryptoType === 2 ? webConf.CryptoKeyAes : localStorage.getItem("CryptoKeyAes")

        密文对象.a = encryption_By_Aes_CBC_192(JSON.stringify(data), aesKey)
        密文对象.b = CryptoJS.MD5(密文对象.a + aesKey).toString();  //b为签名, md5(密文对象.a + aes密钥)
        data = 密文对象
    }

    if (webConf.CryptoType === 3 && RSA) { //加密类型为3  强制Rsa加密的
        let Rsa密文对象 = {a: "", b: ""}
        let tempAesKey = getRandomString(24) //临时AES密钥 随机24位字母数字
        Rsa密文对象.a = encryption_By_Aes_CBC_192(JSON.stringify(data), tempAesKey) //a值为 随机aes密钥加密后字节数组,再转为base64编码文本
        // @ts-ignore
        var verify = new JSEncrypt2();         //发包 为公钥加密(临时Aes密钥)
        verify.setPublicKey(webConf.CryptoKeyPublic);
        Rsa密文对象.b = verify.encrypt(tempAesKey); //b值为 RSA公钥加密(临时AES密钥)
        data = Rsa密文对象
    }


    //发送post信息===========================
    let ret = service({
        url: webConf.AppWeb,
        method: 'post',
        data: data
    })
    //密文解密再 request中间件 拦截响应内   http response 拦截响应   可以去查看

    return ret
}

export const FetchLogin = (UserOrKa = '', PassWord = '', Key = '', Tab = '', AppVer = '') => {
    let data = {
        "Api": "UserLogin",
        "UserOrKa": UserOrKa,
        "PassWord": PassWord,
        "Key": Key,
        "Tab": Tab,
        "AppVer": AppVer,
    }
    return SendPost(data, true)
}

export const FetchToken = () => {
    localStorage.setItem("kyToken", "") //先清除本地的Token
    let data = {
        "Api": "GetToken",
    }

    return SendPost(data, true)
}