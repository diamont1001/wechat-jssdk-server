/**
 * 数据缓存（内存）
 *
 * Created by Chenjr on 2016/04/16.
 * @dependency node-cache (https://github.com/tcs-de/nodecache)
 */

'use strict';

const cluster = require('cluster'),
    cache = require('cluster-node-cache')(cluster),
    logger = require('./logger').logger('clusterCache');

class ClusterCache {

    /**
     * 设置缓存
     * @param key 缓存Key
     * @param value 缓存value
     * @param ttl 缓存时间（单位：秒，默认：30分钟）
     */
    static set(key, value, ttl, onSuccess, onError) {
        onSuccess = (typeof onSuccess == 'function') ? onSuccess : function(){};
        onError = (typeof onError == 'function') ? onError : function(){};

        ttl = ttl || 1800;

        cache.set(key, value, ttl).then(function(result) {
            if(result.err) {
                logger.warn(`set cache error.[${key}][${ttl}]`);
                onError(result.err);
            } else {
                logger.trace(`set cache ok.[${key}][${ttl}]`);
                onSuccess(result.success);
            }
        });
    }

    /**
     * 获取缓存
     * @param key 缓存key
     * @returns {*}
     */
    static get(key, onSuccess, onError) {
        onSuccess = (typeof onSuccess == 'function') ? onSuccess : function(){};
        onError = (typeof onError == 'function') ? onError : function(){};

        cache.get(key).then(function(results) {
            if(results.err) {
                logger.warn(`get cache error.[${key}]`);
                onError(result.err);
            } else {
                if(results.value && results.value[key]) {
                    logger.trace(`get cache ok.[${key}]`);
                    onSuccess(results.value[key]);
                } else {
                    logger.trace(`get cache empty.[${key}]`);
                    onError();
                }
            }
        });
    }

    /**
     * 移除缓存
     * @param key 缓存key
     */
    static remove(key) {
        cache.del(key);
    }

    /**
     * 移除所有缓存
     */
    static removeAll() {
        cache.flushAll();
    }

}
module.exports = ClusterCache;