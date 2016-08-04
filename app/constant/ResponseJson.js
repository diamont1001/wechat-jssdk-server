/**
 * 统一接口返回规范
 * {
 *      state: {
 *          code: 2000000,
 *          msg: "ok"
 *      },
 *      data: xxxx // 返回的数据放这里
 * }
 * Created by Chenjr on 2016/1/21.
 */

var logger = require('../utils/logger').logger('ResponseJson');

module.exports = (function(){
    var _e = {};

    // state.code返回码枚举类型
    var _code = {
        ok: 2000000,
        parameterError: 4000000, // 参数错误
        internalError: 5000000 // 内部出错
    };
    // state.msg返回码对应的提示信息
    var _msg = [];
    _msg[_code.ok] = 'ok';
    _msg[_code.internalError] = 'Internal Error';
    _msg[_code.parameterError] = 'Parameter Error';

    /**
     * 格式化返回JSON字符串
     * @param code
     * @param data - 要返回的数据
     */
    _e.formatJson = function(code, data){
        code = code || _code.ok;

        var json = {
            state: {
                code: code,
                msg: _msg[code]
            },
            data: data || ''
        };
        var jsonStr = '';
        try {
            jsonStr = JSON.stringify(json);
        } catch(e) {
            logger.warn('e:' + e);
        }
        return jsonStr;
    };

    /**
     * 格式化返回对象
     * @param code
     * @param data - 要返回的数据
     */
    _e.format = function(code, data){
        code = code || _code.ok;
        
        var json = {
            state: {
                code: code,
                msg: _msg[code]
            },
            data: data || ''
        };
        return json;
    };

    _e.code = _code;
    return _e;
})();