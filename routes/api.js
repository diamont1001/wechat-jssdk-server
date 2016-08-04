/**
 * API路由配置
 *
 * Created by Chenjr on 2016/04/16.
 */

'use strict';

const Router = require('koa-router'),
    ApiController = require('../app/controllers/ApiController'),
    router = new Router({
        prefix: global.config.locals.publicPath + '/api'
    });

router.get('/test', ApiController.test);

module.exports = router;