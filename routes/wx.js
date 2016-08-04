/**
 * API路由配置
 *
 * Created by Chenjr on 2016/04/16.
 */

'use strict';

const Router = require('koa-router'),
    WxController = require('../app/controllers/WxController'),
    router = new Router({
        prefix: global.config.locals.publicPath + '/wx'
    });

// 公众号服务器认证
router.get(global.config.locals.router.wx.service, WxController.service);
router.post(global.config.locals.router.wx.service, WxController.service);

router.get(global.config.locals.router.wx.config, WxController.config);

router.get(global.config.locals.router.wx.auth, WxController.auth);

router.get(global.config.locals.router.wx.auth2, WxController.auth2);

module.exports = router;
