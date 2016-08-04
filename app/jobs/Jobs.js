/**
 * 自运行jobs写这里
 * Created by Chenjr on 2016/3/2.
 */

const WxJobs = require('./WxJobs');

module.exports = (function() {
    var _e = {},
        _init = false;

    _e.start = function(interval) {
        if(_init) {
            return ;
        }
        _init = true;

        WxJobs.start();
    };

    return _e;
})();