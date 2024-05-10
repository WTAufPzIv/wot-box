import { webConf } from '@core/const/api';
import CryptoJS from 'crypto-js';
import {JSEncrypt2} from './ras-public-decrypt';

//返回的是base64编码后的密文
export function encryption_By_Aes_CBC_192(content: any, secretKey: string) {
    let key = CryptoJS.enc.Utf8.parse(secretKey); // 将密钥转换为字节数组
    let iv = CryptoJS.lib.WordArray.create(16); // 创建一个长度为16的字节数组，初始值为0
    let srcs = CryptoJS.enc.Utf8.parse(content);
    //使用 cbc192 方式 加密
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 192 / 8
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);  //aes加密结果,进行base64编码, 赋给a值
}

export function decryption_By_Aes_CBC_192(encryptedContent: any, secretKey: string) {

    let key = CryptoJS.enc.Utf8.parse(secretKey); // 将密钥转换为字节数组
    let iv = CryptoJS.lib.WordArray.create(16); // 创建一个长度为16的字节数组，初始值为0
    let decryptData = CryptoJS.AES.decrypt(encryptedContent, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 192 / 8
    }).toString(CryptoJS.enc.Utf8);
    return decryptData
}


export function decrypt_By_Aes_CBC_192(encryptedContent: any, secretKey: string) {

    let key = CryptoJS.enc.Utf8.parse(secretKey); // 将密钥转换为字节数组
    let iv = CryptoJS.lib.WordArray.create(16); // 创建一个长度为16的字节数组，初始值为0
    let decryptData = CryptoJS.AES.decrypt(encryptedContent, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 192 / 8
    }).toString(CryptoJS.enc.Utf8);
    return decryptData
}


export function encryption_and_signature_Aes(encryptedPayload: any) {
    //Aes解密并验证签名
    //如果加密类型为2  就是用配置的密钥,如果加密类型为3 就是用GetToken接口返回的密钥
    let aesKey = webConf.CryptoType === 2 ? webConf.CryptoKeyAes : localStorage.getItem("CryptoKeyAes")

    let key = CryptoJS.enc.Utf8.parse(aesKey); // 将密钥转换为字节数组
    let iv = CryptoJS.lib.WordArray.create(16); // 创建一个长度为16的字节数组，初始值为0
    // 验证签名
    let 签名 = CryptoJS.MD5(encryptedPayload.a + aesKey).toString();

    if (签名.toUpperCase() !== encryptedPayload.b) { //返回的签名是大写 所以要转大写
        localStorage.setItem("集_错误信息", "md5签名验证失败")
        return {};
    }

    // 解密
    let 解密的数据 = CryptoJS.AES.decrypt(encryptedPayload.a, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 192 / 8
    }).toString(CryptoJS.enc.Utf8);

    // 转换为对象
    let 解密后的对象 = JSON.parse(解密的数据);

    return 解密后的对象
}

export function RsaPublicDecrypt(decryptedBase64: any) {
    // @ts-ignore
    var rasTarget = new JSEncrypt2();         //发包 为公钥加密(临时Aes密钥)
    rasTarget.setPublicKey(webConf.CryptoKeyPublic);

    let tempAesKey = rasTarget.decrypt(decryptedBase64);
    //临时AES密钥 随机24位   !!注意,不一定是字符串,而是24位字节数组, 所以打印可能是乱码,解密只要检测是否有值就可以了,解密失败会返回空的
    return tempAesKey; // 将密钥转换为字节数组

}