/**
 * 对外接口
 *
 * Created by Chenjr on 2016/04/16.
 */

'use strict';

const BaseController = require('./BaseController'),
    logger = require('../utils/logger').logger('ApiController'),
    Redis = require('../utils/redis'),
    ApiService = require('../services/ApiService');

class ApiController extends BaseController {

	// 测试
    static *test() {
    	const order = this.query.order;
    	logger.info('test order: ' + order);

    	switch(order) {
    		case 'redis_clear': 
    			var keys = yield Redis.keys('wechat_jssdk_server_*');
    			logger.trace(keys);
    			for(let i = 0; i < keys.length; i++) {
    				yield Redis.del(keys[i]);
    			}
    			break;
    		case 'redis_keys':
    			var keys = yield Redis.keys('*');
    			this.body = keys;
    			break;
    		default: 
    			break;
    	}
    }
}

module.exports = ApiController;
