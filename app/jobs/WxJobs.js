/**
 * 微信相关自更新任务
 * Created by Chenjr on 2016/8/3.
 */

const WxService = require('../services/WxService');

module.exports = (function() {
    var _e = {},
        _init = false;

    _e.start = function() {
        if(_init) {
            return ;
        }
        _init = true;

        WxService.checkCacheAccessToken();
        WxService.refreshAuthAccessToken();
        setInterval(function() {
            // 微信接口access_token检测更新
            WxService.checkCacheAccessToken();

            // 微信网页授权access_token检测更新
            WxService.refreshAuthAccessToken();
        }, 1000 * 60); // 1分钟
    };

    return _e;
})();