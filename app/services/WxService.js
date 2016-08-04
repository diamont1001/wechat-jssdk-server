/**
 * 微信JSSDK服务器接口服务逻辑
 *
 * Created by Chenjr on 2016/04/20.
 */

'use strict';

const Querystring = require('querystring'),
	WxApi = require('../common/WxApi'),
	Redis = require('../utils/redis'),
    logger = require('../utils/logger').logger('WxService'),
    ResponseJson = require('../constant/ResponseJson'),
    WxConfig = require('../constant/WxConfig');

// logger.trace(WxConfig);

class WxService {

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
    	return WxApi.checkSignature(token, signature, timestamp, nonce);
    }

    // [GET]获取前端config注入所需参数
    static config(signatureUrl, nonceStr, timestamp) {
    	return new Promise((resolve, reject) => {
    		if(!signatureUrl) {
    			logger.warn('Parameter Error');
    			return resolve(ResponseJson.formatJson(ResponseJson.code.parameterError));
    		}

	        //get token from redis
	        Redis.get(WxConfig.redisKey.token)
	        	.then(token => {
	                // get ticket from redis
	                Redis.get(WxConfig.redisKey.ticket)
	                	.then(ticket => {
		                    let sign = WxApi.generateSignature(ticket, signatureUrl, nonceStr, timestamp);
		                    output(sign);
		                })
		                .catch(error => {
		                	logger.trace('redis get nothing. key: ' + WxConfig.redisKey.ticket);
	                		output(null);
		                });
		        })
		        .catch(error => {
		        	logger.trace('redis get nothing. key: ' + WxConfig.redisKey.token);
		            output(null);
		        });

	        function output(signature){
	            let outputStr = '';
	            if(signature) {
	                outputStr = ResponseJson.formatJson(ResponseJson.code.ok, {
	                    appId: WxConfig.appId,
	                    timestamp: timestamp,
	                    nonceStr: nonceStr,
	                    signature: signature
	                });
	            } else {
	                outputStr = ResponseJson.formatJson(ResponseJson.code.internalError, '');
	            }

	            resolve(outputStr);
	        }
	    });
    }

    static auth(host, protocol, dest, scope, openId) {
    	return new Promise((resolve, reject) => {
	    	// 请求微信获取code，code用于换取access_token
	        const codeLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + WxConfig.appId +
	            '&redirect_uri=' + encodeURIComponent(protocol + '://' + host + global.config.locals.publicPath + '/wx/auth2?dest=' + encodeURIComponent(dest)) +
	            '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect';

	        if(openId) {
	            // 已有openId，直接查找返回
	            logger.debug('[auth] has openId:' + openId);

	            Redis.get(WxConfig.redisKey.authAccessToken + openId)
	            	.then(strData => {
	            		logger.trace('[auth] Redis.getAuthAccessToken ok. openId: ' + openId);
	            		logger.trace(strData);

		                (!strData) && (strData = "{}");
		                let data = JSON.parse(strData);

		                if(data.access_token) {
		                    // 检测access_token有效性
		                    WxApi.checkAuthAccessToken(data.access_token, data.openid)
		                    	.then(ret => {
		                            WxApi.getUserInfo(data.access_token, data.openid)
		                            	.then(info => {
		                            		logger.trace('[auth] getUserInfo ok.');
			                                logger.trace(info);

			                                let paramsStr = Querystring.stringify({userinfo: JSON.stringify(info)}),
			                                    op = dest.indexOf('?') >= 0 ? '&' : '?';

			                                resolve(dest + op + paramsStr);
			                            });
			                    })
			                    .catch(error => {
			                        logger.warn('[auth] checkAuthAccessToken failed.');
			                    	resolve(codeLink);
			                    });
		                } else {
		                    logger.warn('[auth] access_token empty. openId: ' + openId);
		                    resolve(codeLink);
		                }
		            })
		            .catch(error => {
		            	logger.warn('[auth] Redis.getAuthAccessToken failed. openId: ' + openId);
    					logger.warn(error);

		            	resolve(codeLink);
		            });
	        } else {
	            resolve(codeLink);
	            logger.warn('[auth] openId empty.');
	        }
	    });
    }

    static auth2(dest, code, state, ctx) {
    	logger.trace('[auth2] start. dest: ' + dest + ', code: ' + code + ', state: ' + state);

    	return new Promise((resolve, reject) => {
    		WxApi.getAuthAccessToken(WxConfig.appId, WxConfig.secret, code)
    			.then(data => {
    				logger.trace('[auth2] getAuthAccessToken ok.');
    				logger.trace(data);

	                // 最后一步，获取用户信息
	                WxApi.getUserInfo(data.access_token, data.openid)
	                	.then(info => {
	                		logger.trace('[auth2] getUserInfo ok.');
    						logger.trace(info);

		                    let paramsStr = Querystring.stringify({userinfo: JSON.stringify(info)}),
		                        op = dest.indexOf('?') >= 0 ? '&' : '?';

		                    // 利用cookie保存用户openId
		                    try {
		        				ctx.cookies.set(WxConfig.cookieOpenId, info.openid);
		        				logger.trace('[auth2] set cookie ok. ' + WxConfig.cookieOpenId + '=' + info.openid);
		        			} catch(e) {
		        				logger.error('[auth2] set cookie failed. e:' + e);
		        			}

		                    resolve(dest + op + paramsStr);
		                })
		                .catch(error => {
		                	logger.warn('[auth2] getUserInfo failed.');
    						logger.warn(error);

		                	let paramsStr = Querystring.stringify({userinfo:'{"error": "get wx getUserInfo fail", "errcode": ' + error.errcode + '}'}),
			                    op = dest.indexOf('?') >= 0 ? '&' : '?';

			                resolve(dest + op + paramsStr);
		                });

	                // 缓存refresh_token等结果
	                // Redis.tryLock('save_' + WxConfig.redisKey.authAccessToken + data.openid, 3000)
	                Redis.tryLock(WxConfig.redisKey.authAccessToken + data.openid, 3000)
	                	.then(lock => {
		                    if(lock) {
		                        this.saveAuthAccessToken(data, WxConfig.refreshTokenExpire)
		                        	.then(ret => {
		                        		Redis.unlock(lock);
		                        	})
		                        	.catch(error => {
		                        		Redis.unlock(lock);
		                        	});
		                    }
		                });
		        })
		        .catch(error => {
		        	logger.warn('[auth2] getAuthAccessToken failed.');
    				logger.warn(error);

		        	//构造回调url
	                let paramsStr = Querystring.stringify({userinfo:'{"error": "get wx access_token fail", "errcode": ' + error.errmsg + '}'}),
	                    op = dest.indexOf('?') >= 0 ? '&' : '?';

	                resolve(dest + op + paramsStr);
		        });
    	});
    }

    // 保存网页授权access_token全部数据(openId作为key)
    static saveAuthAccessToken(info, expires) {
    	return new Promise((resolve, reject) => {
	        if(info && info.access_token && info.refresh_token && info.openid) {
	            // 检测access_token有效性
	            WxApi.checkAuthAccessToken(info.access_token, info.openid)
	            	.then(ret => {
	            		logger.trace('[saveAuthAccessToken] checkAuthAccessToken ok.');
    					logger.trace(ret);

	                    info.last_update_time = Date.now() / 1000; // 更新时间
	                    expires = expires > 0 ? expires : WxConfig.refreshTokenExpire;
	                    Redis.setAndExpire(WxConfig.redisKey.authAccessToken + info.openid, JSON.stringify(info), expires)
	                    	.then(ret => {
	                    		logger.info('[saveAuthAccessToken] save auth_access_token ok.');
	                    		logger.info(info);
	                    		resolve(true);
	                    	})
	                    	.catch(error => {
	                    		logger.warn('[saveAuthAccessToken] save auth_access_token failed.');
	                    		logger.warn(info);
	                    		reject(false);
	                    	});
	                })
	                .catch(error => {
	                    logger.warn('[saveAuthAccessToken] checkAuthAccessToken failed.');
	                    logger.warn(error);
	                    reject(false);
	                });
	        } else {
	            logger.warn('[saveAuthAccessToken] info error.');
	            reject(false);
	        }
	    });
    }

    // 检查更新redis里的access_token
    static checkCacheAccessToken() {
        Redis.getExpire(WxConfig.redisKey.token).then(leftSeconds => {
	        logger.trace('[checkCacheAccessToken] access_token expire: ' + leftSeconds);

	        // 8分钟以内过期，马上更新
	        if(leftSeconds < 60 * 8) {
	        	logger.trace('[checkCacheAccessToken] expire < 60 * 80, need to be updated.');

	            // 上锁3秒，足够处理
	            Redis.tryLock(WxConfig.redisKey.token, 3000).then(lock => {
		            if(lock) {
		                // 加锁成功才处理，避免Cluster模式下多机器的冲突
		                WxApi.getAccessToken(WxConfig.appId, WxConfig.secret)
		                	.then(data => {
			                    logger.trace('[checkCacheAccessToken] getAccessToken ok.');
			                    logger.trace(data);

			                    if(data && data.access_token && data.expires_in) {
			                        Redis.setAndExpire(WxConfig.redisKey.token, data.access_token, data.expires_in)
			                        	.then(ret1 => {
			                                logger.info('[checkCacheAccessToken] set access_token in redis ok. access_token:' + data.access_token);

			                                // 获取jsapi ticket
			                                WxApi.getJsApiTicket(data.access_token)
			                                	.then(data1 => {
				                                    logger.debug('Get jsapi_ticket from wx ok.');
				                                    logger.debug(data1);

				                                    Redis.setAndExpire(WxConfig.redisKey.ticket, data1.ticket, data1.expires_in)
				                                    	.then(ret2 =>{
				                                    		// unlock your resource when you are done
						                                    Redis.unlock(lock);
					                                        logger.info('set ' + WxConfig.redisKey.ticket + ' success. jsapi_ticket:' + data1.ticket);
					                                    })
					                                    .catch(error => {
					                                    	Redis.unlock(lock);
					                                    	logger.warn('set ' + WxConfig.redisKey.ticket + ' failed. jsapi_ticket:' + data1.ticket);
					                                    });
			                                	})
			                                	.catch(error => {
			                                		Redis.unlock(lock);
			                                		logger.warn('Get jsapi_ticket from wx failed. access_token:' + data.access_token);
			                                	});
				                        })
				                        .catch(error => {
			                                logger.warn('[checkCacheAccessToken] set access_token in redis failed. access_token:' + data.access_token);
			                                logger.warn(error);
				                        	Redis.unlock(lock);
				                        });
			                    } else {
			                        logger.warn('[checkCacheAccessToken] access_token error.');
			                        Redis.unlock(lock);
			                    }
			                })
			                .catch(error => {
			                	logger.warn('[checkCacheAccessToken] getAccessToken failed.');
			                	logger.warn(error);
			                	Redis.unlock(lock);
			                });
		            }
		        });
	        }
	    });
    }

    // 更新redis里的auth_access_token
    static refreshAuthAccessToken() {
        Redis.keys(WxConfig.redisKey.authAccessToken + '*').then(keys => {
	        logger.trace(keys);

	        if(keys && keys.length > 0) {
	            for(let i = 0; i < keys.length; i++) {
	                Redis.get(keys[i]).then(strInfo => {
		                try {
		                    let info = JSON.parse(strInfo);
		                    if((Date.now() / 1000 - info.last_update_time) > (info.expires_in - 60 * 8)) { // access_token在最后8分钟就要先刷新一次了
		                        
		                        // 上锁3秒，足够处理
		                        Redis.tryLock(WxConfig.redisKey.authAccessToken + info.openid, 3000).then(lock => {
			                        if(lock) {
			                            WxApi.refreshAuthAccessToken(WxConfig.appId, info.refresh_token)
			                            	.then(data => {
			                            		logger.trace('[refreshAuthAccessToken] refreshAuthAccessToken from wx ok.');
			                            		logger.trace(data);

				                                // 更新redis
			                                    Redis.getExpire(WxConfig.redisKey.authAccessToken + info.openid)
			                                    	.then(expires => {
				                                        // this.saveAuthAccessToken(info, expires)
				                                        this.saveAuthAccessToken(data, expires)
				                                        	.then(ret => {
				                                        		logger.info('[refreshAuthAccessToken] saveAuthAccessToken ok.');
					                                            Redis.unlock(lock);
					                                        })
					                                        .catch(error => {
					                                        	logger.warn('[refreshAuthAccessToken] saveAuthAccessToken failed.');
					                                        	logger.warn(error);
					                                        	Redis.unlock(lock);
					                                        });
				                                    })
				                                    .catch(error => {
				                                    	logger.warn('[refreshAuthAccessToken] get expires error, key: ' + WxConfig.redisKey.authAccessToken + info.openid);
				                            			logger.warn(error);
				                                    	Redis.unlock(lock);
				                                    });
				                            })
				                            .catch(error => {
				                            	logger.warn('[refreshAuthAccessToken] refresh auth access_token error');
				                            	logger.warn(error);
				                            	Redis.unlock(lock);
				                            });
			                        }
			                    });
		                    }
		                } catch(e){
		                    logger.warn('e:' + e);
		                }
		            });
	            }
	        }
	    });
    };
}

module.exports = WxService;