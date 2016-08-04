/**
 * Created by Chenjr on 2015/7/14.
 */

'use strict';

const paUtil = (function() {
    var _e = {};

    // 格式化URL参数
    _e.queryFormat = function (url, obj) {
        if (obj) {
            var op = '?';
            if (url.indexOf('?') != -1) {
                op = '&';
            }
            for (var i in obj) {
                if (obj.hasOwnProperty(i) && obj[i] != null && obj[i] != undefined && obj[i] !== '') {
                    url += op + i + '=' + encodeURIComponent(obj[i]);
                    op = '&';
                }
            }
        }
        return url;
    };

    //获取文档尺寸
    _e.getdomSize = function() {
        return {
            width: document.documentElement.offsetWidth || document.body.offsetWidth,
            height: document.documentElement.offsetHeight || document.body.offsetHeight,
            scrollT: document.documentElement.scrollTop || document.body.scrollTop
        }
    };

    /**
     * 获取浏览器尺寸可见区域尺寸
     *  - 解决了Webview一开始获取尺寸为0的问题
     *  @param times - 获取次数，可不选，默认为10
     */
    _e.getWinSize = function (callback, times) {
        var winHeight = 0, winWidth = 0;
        times = isNaN(parseInt(times)) ? 10 : parseInt(times);

        if (window.innerWidth) {
            winWidth = window.innerWidth;
        } else if ((document.body) && (document.body.clientWidth)) {
            winWidth = document.body.clientWidth;
        }
        if (window.innerHeight) {
            winHeight = window.innerHeight;
        } else if ((document.body) && (document.body.clientHeight)) {
            winHeight = document.body.clientHeight;
        }
        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
            winHeight = document.documentElement.clientHeight;
            winWidth = document.documentElement.clientWidth;
        }
        if((times-- > 0) && (winHeight <= 0 || winWidth <= 0)) {
            //webview有可能获取到的为0，延时再取一次
            setTimeout(function() {
                util.getWinSize(callback, times);
            }, 200);
        }else {
            callback({
                height: winHeight,
                width: winWidth
            });
        }
    };

    _e.checkPhone = function(val) {
        var re = /^((13[0-9])|(14[5,7,9])|(15[^4,\D])|(17[0,6-8])|(18[0-9]))\d{8}$/;
        if (re.test(val)) {
            return true;
        } else {
            return false;
        }
    };

    //在数组(arr)指定位置(i)插入元素(item)
    _e.insertArray = function(arr, i, item) { arr.splice(i, 0, item); };

    // 判断是否对象，并且为非空和非{}
    _e.isObjectNotEmpty = function(a) {
        if (typeof a === "object" && !(a instanceof Array)){
            for (var i in a){
                return true;
                break;
            }
            return false;
        } else {
            return false;
        }
    };

    // 生成长度为n的随机字符串
    _e.getNonceStr = function(len) {
        var nonceStr = '',
            chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
            'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];

        for(var i = 0; i < len; i++){
            var ran = Math.ceil(Math.random() * 61);
            nonceStr += chars[ran];
        }
        return nonceStr;
    };

    return _e;
})();

module.exports = paUtil;
