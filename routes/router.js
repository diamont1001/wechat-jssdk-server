/**
 * 路由配置入口
 *
 * Created by Chenjr on 2016/04/16.
 */

'use strict';

const logger = require('../app/utils/logger').logger('router');

module.exports = function (app) {

    // 注册路由
    app.use(require('./api').routes());
    app.use(require('./wx').routes());

    // 错误及404处理
    app.use(function *(next) {
        try {
            yield next;
        } catch (error) {
            logger.error(error.stack);
        }
        yield this.render('errors/404');
    });

};