/**
 * ppproxy服务器协议
 *
 * Created by Chenjr on 2015/7/9.
 */

'use strict';

const Https = require('https'),
    logger = require('../utils/logger').logger('WxProtocol'),
    Util = require('../utils/util'),
    HttpCode = require('../constant/HttpCode');

class WxProtocol {

    static getResourceFromWx(url) {
        return new Promise((resolve, reject) => {
            Https.get(url, res => {
                var len = 0;
                var chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                    len += chunk.length;
                });

                res.on('end', () => {
                    var body = Buffer.concat(chunks, len);
                    var data = JSON.parse(body.toString()); //微信回调数据
                    resolve(data);
                })
            }).on('error', function(e){
                logger.warn('Get resourece from wx error. ' + e.message);
                reject(e);
            });
        });
    }

}

module.exports = WxProtocol;