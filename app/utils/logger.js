/**
 * log4js
 * Created by Chenjr on 2015/12/17.
 */

'use strict';

var Path = require('path');
var log4js = require('log4js');
var logFile = Path.join(__dirname, '../../private/log/debug.log');
var config = require('../../conf/config.json');

log4js.configure({
    appenders: [
        { type: 'console' }, //控制台输出
        {
            type: "dateFile",
            filename: logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false,
            maxLogSize: 1024
        }
    ],
    replaceConsole: true
});

/**
 *
 * @param type: i.e. index => [2015-12-17 11:13:51.723] [INFO] index - This is an index page!
 * @returns {*|{topic, should take a category and return a logger, log events}}
 */
exports.logger = function(type){
    var logger = log4js.getLogger(type);
    logger.setLevel(config.log4js.level); // 'ALL' < 'TRACE' < 'DEBUG' < 'INFO' < 'WARN' < 'ERROR' < 'FATAL' < 'MARK'
    return logger;
};

console.info('config.log4js.level:' + config.log4js.level);