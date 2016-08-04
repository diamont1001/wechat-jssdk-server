/**
 * 微信相关配置
 *
 * Created by Chenjr on 2016/08/03
 */
'use strict';

const WxConfig = {
	appId: global.config.wechat.appId, // 微信应用ID
    secret: global.config.wechat.secret, // 微信应用密钥
    token: global.config.wechat.token,

    redisKey: {
        token: 'wechat_jssdk_server_access_token',
        ticket: 'wechat_jssdk_server_jsapi_ticket',
        authAccessToken: 'wechat_jssdk_server_oauth_access_token_' // auth2.0网页授权access_token，缓存KEY规则为 rediskey + openid
    },
    cookieOpenId: 'wechat_jssdk_server_openid',

    refreshTokenExpire: 3600 * 24 * 7, // refresh_token过期时间(7天)
    nonceStrNum: 15, // 签名随机数字符串长度
    timestampNum: 10 // timestamp字符串长度
};

module.exports = WxConfig;
