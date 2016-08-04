/**
 * 对外接口
 *
 * Created by Chenjr on 2016/04/16.
 */

'use strict';

const BaseController = require('./BaseController'),
    logger = require('../utils/logger').logger('WxController'),
    Util = require('../utils/util'),
    WxConfig = require('../constant/WxConfig'),
    WxService = require('../services/WxService');

class WxController extends BaseController {

	// 公众号服务器认证
    static *service() {
    	const params = (this.method.toLowerCase() === 'post') ? this.req.body : this.query,
    		signature = params.signature, // 微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
    		timestamp = params.timestamp, // 时间戳
    		nonce = params.nonce, // 随机数
        	echostr = params.echostr, // 随机字符串
        	result = WxService.checkSignature(WxConfig.token, signature, timestamp, nonce);

        if(result) {
            // 来自于微信服务器
            logger.info('getService ok. echostr:' + echostr);
            this.body = echostr; // 验证
        } else {
            logger.warn('not weixin server!');
            this.body = 'not weixin server!';
        }
    }

    // [GET]获取前端config注入所需参数
    static *config() {
    	const params = this.query,
            signatureUrl = params.url,
            nonceStr = Util.getNonceStr(WxConfig.nonceStrNum), // 生成指定数量的随机字符串
            timestamp = new Date().getTime().toString().substr(0, WxConfig.timestampNum), // 生成签名的时间戳
            jsonpCallback = params.callback, // jsonp回调函数

        	outputStr = yield WxService.config(signatureUrl, nonceStr, timestamp);

        logger.trace(`outputStr: ${outputStr}`);

        if(jsonpCallback) {
	        this.body = jsonpCallback + '(' + outputStr + ')';
	    } else {
	    	this.body = outputStr;
	    }
    }

    /**
     * OAuth2.0网页授权，页端直接访问
     * @param [GET] dest - 回调地址
     * @param [GET] openid - 页端授过权后，手动保存openid到localStorage，下次请求的时候带上就不用再授权了
     * @param [GET] scope - scope设置类型，默认为snsapi_userinfo，即获取用户基本信息，若params.scope=snsapi_base，则只能获取openid，并且进行用户无感知授权跳转
     */
    static *auth() {
    	const host = this.headers['host'],
            protocol = this.protocol || 'http',
            dest = this.query.dest,
            scope = this.query.scope ? this.query.scope : 'snsapi_userinfo',
            openId = this.query.openid || this.cookies.get(WxConfig.cookieOpenId),

        	url = yield WxService.auth(host, protocol, dest, scope, openId);

        this.redirect(url);
    }

    // 微信网页授权，步骤2（auth步骤后微信自动回调过来的）
    static *auth2() {
    	const dest = this.query.dest || '', // 回调到前端的地址
            code = this.query.code, //若用户禁止授权，则重定向后不会带上code参数，仅会带上state参数
            state = this.query.state,

        	url = yield WxService.auth2(dest, code, state, this);

        this.redirect(url);
    }
}

module.exports = WxController;
