/**
 * ppproxy服务器接口封装
 *
 * Created by Chenjr on 2015/7/9.
 */

'use strict';

const WxProtocol = require('./WxProtocol'),
    Crypto = require('crypto'),
    Utils = require('../utils/util'),
    logger = require('../utils/logger').logger('WxApi');

class WxApi extends WxProtocol{

    /**
     * 校验微信服务器签名
     * @param signature - 微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
     * @param token - 授权TOKEN，在公众号管理页配置的
     * @param timestamp - 时间戳
     * @param nonce - 随机数
     *
     * @return 
     */
    static checkSignature(token, signature, timestamp, nonce) {
        var tmpArr = [token, timestamp, nonce];
        tmpArr.sort();
        var tmpStr = tmpArr.join('');
        var shasum = Crypto.createHash('sha1');
        shasum.update(tmpStr);
        var shaResult = shasum.digest('hex');

        logger.debug('TOKEN:' + token);
        logger.debug('signature:' + signature);
        logger.debug('timestamp:' + timestamp);
        logger.debug('nonce:' + nonce);
        logger.debug('shaResult:' + shaResult);

        return (shaResult == signature);
    }

    /**
     * 生成签名
     * @param ticket
     * @param url
     * @param nonceStr
     * @param timestamp
     *
     * @return signature
     */
    static generateSignature(ticket, url, nonceStr, timestamp) {
        if(ticket){
            var tmpArr = [
                'noncestr=' + nonceStr,
                'jsapi_ticket=' + ticket,
                'timestamp=' + timestamp,
                'url=' + url
            ];
            tmpArr.sort();
            var tmpStr = tmpArr.join('&');
            var sha1 = Crypto.createHash('sha1');
            sha1.update(tmpStr);
            var sha1Rst = sha1.digest('hex');
            return sha1Rst;
        }else{
            return '';
        }
    }

    /**
     * 获取微信access_token
     * @param appId - 微信应用ID
     * @param secret - 微信应用密钥
     */
    static getAccessToken(appId, secret) {
        return super.getResourceFromWx('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + secret);
    }

    /**
     * 通过token去获取微信jsapi的ticket
     * @param token - getAccessToken获取的token
     */
    static getJsApiTicket(token){
        return super.getResourceFromWx('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi');
    }

    /**
     * 通过code换取网页授权auth2.0的access_token
     * @param appId - 微信应用ID
     * @param secret - 微信应用密钥
     * @param code - 用户同意授权后获取的code
     */
    static getAuthAccessToken(appId, secret, code) {
        return new Promise((resolve, reject) => {
            super.getResourceFromWx('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appId + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code')
                .then(ret => {
                    if(!ret || ret.errcode){ //微信返回错误信息
                        reject(ret);
                    } else {
                        resolve(ret);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * 通过refresh_token刷新网页授权access_token
     * @param appId - 微信应用ID
     * @param refreshToken - 用户刷新access_token，从上一次getAuthAccessToken()获取
     */
    static refreshAuthAccessToken(appId, refreshToken) {
        return new Promise((resolve, reject) => {
            super.getResourceFromWx('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appId + '&grant_type=refresh_token&refresh_token=' + refreshToken)
                .then(ret => {
                    if(ret && ret.errcode) {
                        reject(ret);
                    } else {
                        if(ret && ret.access_token && ret.refresh_token && ret.openid) {
                            resolve(ret);
                        } else {
                            reject(ret);
                        }
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * 检验授权凭证（access_token）是否有效
     * @param accessToken
     * @param openId
     * @param callback
     *          - { "errcode":0,"errmsg":"ok"}
     *          - { "errcode":40003,"errmsg":"invalid openid"}
     */
    static checkAuthAccessToken(accessToken, openId) {
        return new Promise((resolve, reject) => {
            super.getResourceFromWx('https://api.weixin.qq.com/sns/auth?access_token=' + accessToken + '&openid=' + openId)
                .then(ret => {
                    (!ret) && (ret = {});
                    if(ret.errcode == 0) {
                        resolve(true);
                    } else {
                        reject(ret);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * 通过网页access_token获取应用信息
     * @param authAccessToken - 网页授权接口调用凭证（getAuthAccessToken这一步获取得到）,注意：此access_token与基础支持的access_token不同
     * @param openId - 用户唯一标识（getAuthAccessToken这一步获取得到）
     */
    static getUserInfo(authAccessToken, openId, callback) {
        return new Promise((resolve, reject) => {
            super.getResourceFromWx('https://api.weixin.qq.com/sns/userinfo?access_token=' + authAccessToken + '&openid=' + openId + '&lang=zh_CN')
                .then(info => {
                    resolve(info);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

module.exports = WxApi;