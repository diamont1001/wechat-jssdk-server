/**
 * redis
 * Created by lsy on 2015/12/15.
 */

'use strict';

var redis = require('redis');
var Redlock = require('redlock'); // redis lock @https://github.com/mike-marcacci/node-redlock
var config = require('../../conf/config.json');
var logger = require('./logger').logger('redis');

module.exports = (function(){
    var _e = {
        client: null,
        redlock: null
    };

    var connectRedis = function(){
        _e.client.on('connect', function(){
            logger.info('redis connect success');
        });
        _e.client.on("error", function(error) {
            logger.error(error);
        });

        /**
         * 返回满足给定pattern的所有key
         * @param pattern
         */
        _e.keys = function(pattern) {
            return new Promise((resolve, reject) => {
                _e.client.keys(pattern, (err, rst) => {
                    if (!err) {
                        if (rst) {
                            resolve(rst);
                        } else {
                            reject(err);
                        }
                    } else {
                        reject(err);
                    }
                });
            });
        };

        // 写缓存（缓存时间会置为长期）
        _e.set = function(key, value){
            return new Promise((resolve, reject) => {
                _e.client.set(key, value, (err, rst) => {
                    if(!err){
                        if(rst){
                            resolve(rst.toString());
                        }else{
                            reject(err);
                        }
                    }else{
                        reject(err);
                    }
                });
            });
        };

        /**
         * 将给定 key 的值设为 value ，并返回 key 的旧值 (old value)
         * @param key
         * @param value
         */
        _e.getset = function(key, value){
            return new Promise((resolve, reject) => {
                _e.client.getset(key, value, (err, rst) => {
                    if(!err){
                        if(rst){
                            resolve(rst.toString());
                        }else{
                            reject(err);
                        }
                    }else{
                        reject(err);
                    }
                });
            });
        };

        /**
         * set if not exist
         * 当且仅当 key 不存在，将 key 的值设为 value ，并返回1；若给定的 key 已经存在，则 SETNX 不做任何动作，并返回0
         * @param key
         * @param value
         */
        _e.setnt = function(key, value){
            return new Promise((resolve, reject) => {
                _e.client.setnx(key, value, (err, rst) => {
                    if(!err){
                        if(rst === 1){
                            resolve(true);
                        }else{
                            reject(err);
                        }
                    }else{
                        reject(err);
                    }
                });
            });
        };

        _e.setAndExpire = function(key, value, seconds){
            return new Promise((resolve, reject) => {
                logger.trace('setAndExpire start, key: ' + key);
                _e.client.setex(key, seconds, value, (err, rst) => {
                    if(!err){
                        if(rst && rst.toString() === 'OK'){
                            resolve(rst.toString());
                        }else{
                            reject(err);
                        }
                    }else{
                        reject(err);
                    }
                    logger.trace('setAndExpire end, key: ' + key);
                });
            });
        };

        _e.get = function(key){
            return new Promise((resolve, reject) => {
                _e.client.get(key, (err, rst) => {
                    if(!err){
                        if(rst){
                            resolve(rst.toString());
                        }else{
                            reject(err);
                        }
                    }else{
                        reject(err);
                    }
                });
            });
        };

        /**
         * 设置过期时间
         * @param key
         * @param seconds - 过期时间（秒）
         */
        _e.expire = function(key, seconds){
            return new Promise((resolve, reject) => {
                _e.client.expire(key, seconds, (err, reply) => {
                    if (reply === 1) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
            });
        };

        /**
         * 查询过期时间
         * @param key
         * @callback (
         *  -2: 已过期
         *  -1: 不存在/无有效期
         *  > 0: 过期时间（秒）
         * )
         */
        _e.getExpire = function(key){
            return new Promise((resolve, reject) => {
                _e.client.ttl(key, (err, ret) => {
                    var expire = 0;
                    if(!err) {
                        if(ret) {
                            expire = ret;
                        }
                    }
                    resolve(expire);
                });
            });
        };

        /**
         * Checking the Existence of Keys
         * @param key
         */
        _e.exists = function(key) {
            return new Promise((resolve, reject) => {
                _e.client.exists(key, (err, reply) => {
                    if (reply === 1) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
            });
        };

        /**
         * 删除键值
         * @param key
         */
        _e.del = function(key) {
            return new Promise((resolve, reject) => {
                _e.client.del(key, (err, reply) => {
                    //logger.debug(reply);
                    if (reply === 1) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
            });
        };

        /**
         * 尝试加锁（不做重试）
         * @param key
         * @param timeoutMs - 过期自动解锁
         * @param callback(lock handler)
         */
        _e.tryLock = function(key, timeoutMs) {
            return new Promise((resolve, reject) => {
                // the string identifier for the resource you want to lock
                var resource = 'locks:' + key;

                // the maximum amount of time you want the resource locked,
                // keeping in mind that you can extend the lock up until
                // the point when it expires
                var ttl = timeoutMs || 1000;

                _e.redlock.lock(resource, ttl, (err, lock) => {

                    // we failed to lock the resource
                    if(err) {
                        reject(err);
                        logger.warn('tryLock error, resource:' + resource);
                    }

                    // we have the lock
                    else {
                        resolve(lock);
                        logger.debug('tryLock ok, resource:' + resource);
                    }
                });
            });
        };

        _e.unlock = function(lockHandler) {
            lockHandler.unlock();
            logger.debug('unlock ok.');
        };
    };

    var redisConfig = config.redis;
    if(!redisConfig){
        logger.warn('the config of redis has not set');
    }else{
        if(redisConfig.length <= 0){
            logger.warn('the config of redis has no item');
        }else{
            _e.client = _e.client ? _e.client : redis.createClient(redisConfig[0].port, redisConfig[0].host); //创建redis客户端

            // create redis lock client
            _e.redlock = new Redlock(
                // you should have one client for each redis node
                // in your cluster
                [_e.client],
                {
                    // the expected clock drift; for more details
                    // see http://redis.io/topics/distlock
                    driftFactor: 0.01,

                    // the max number of times Redlock will attempt
                    // to lock a resource before erroring
                    retryCount:  0,

                    // the time in ms between attempts
                    retryDelay:  200
                }
            );

            _e.client.on('error', function(err){
                logger.warn(err);
                //如果第一个连不上就连第二个
                if(redisConfig[1]){
                    _e.client = redis.createClient(redisConfig[1].port, redisConfig[1].host);
                    connectRedis();
                }
            });
            connectRedis();
        }
    }

    return _e;
})();