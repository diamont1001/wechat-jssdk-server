# JS-SDK注入权限配置信息接口 #

接口：`/wx/config?url=`

支持Ajax, jsonp

参数URL：调用JS-SDK的当前网页URL（记得encodeURIComponent）

接口返回（遵循[接口协议](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%8D%8F%E8%AE%AE.md)）：
- appId: 公众号ID
- timestamp: 生成签名的Unix时间戳（以秒为单位）
- nonceStr: 随机字符串
- signature: 签名

参考例子：`/public/test/wx/config.html`

返回例子：

	{
	    "state" : {
	        "code" : 2000000,
	        "msg" : "ok"
	    },
	    "data" : {
	        "appId" : "wxc91a34030c7bb9c6",
	        "timestamp" : "1453364807",
	        "nonceStr" : "u78NQJ6FgS4eWW6",
	        "signature" : "10687b5efe41818dbac67203d1473395390f635e"
	    }
	}

## 接口支持JSONP协议方式 ##

比如请求：http://xxx.com/wx/config?url=http%3A%2F%2Fbaidu.com&callback=onSuccess

返回数据：

	abc({
	    "state" : {
	        "code" : 2000000,
	        "msg" : "ok"
	    },
	    "data" : {
	        "appId" : "wxc91a34030c7bb9c6",
	        "timestamp" : "1453364807",
	        "nonceStr" : "u78NQJ6FgS4eWW6",
	        "signature" : "10687b5efe41818dbac67203d1473395390f635e"
	    }
	})

## 微信JS-SDK使用说明 ##
微信JS-SDK是微信公众平台面向网页开发者提供的基于微信内的网页开发工具包。

通过使用微信JS-SDK，网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验。

此文档面向网页开发者介绍微信JS-SDK如何使用及相关注意事项。

参考: [JS-SDK开发者文档](http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E6.AD.A5.E9.AA.A4.E4.BA.8C.EF.BC.9A.E5.BC.95.E5.85.A5JS.E6.96.87.E4.BB.B6)

## JSSDK使用步骤 ##

### 步骤一：绑定域名 ###
先登录微信公众平台进入“[公众号设置](https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN)”的“功能设置”里填写“JS接口安全域名”。

备注：登录后可在“开发者中心”查看对应的接口权限。

### 步骤二：引入JS文件 ###
在需要调用JS接口的页面引入如下JS文件，（支持https）：[http://res.wx.qq.com/open/js/jweixin-1.0.0.js](http://res.wx.qq.com/open/js/jweixin-1.0.0.js)

请注意，如果你的页面启用了https，务必引入 [https://res.wx.qq.com/open/js/jweixin-1.0.0.js](https://res.wx.qq.com/open/js/jweixin-1.0.0.js) ，否则将无法在iOS9.0以上系统中成功使用JSSDK

如需使用摇一摇周边功能，请引入 jweixin-1.1.0.js

备注：支持使用 AMD/CMD 标准模块加载方法加载

### 通过config接口注入权限验证配置（本接口） ###

首先通过本服务器接口获取注入相关参数：

	$.ajax({
        url: 'http://xxx.com/wx/config?url=' + window.location.href,
        type: 'get',
        dataType: 'jsonp',
        jsonp: 'callback',
        jsonpCallback: 'test',
        success: function(rst){
            wxConfig(rst.data);
        },
        error: function(){
            alert('error');
        }
    });

获取到参数后，即可调用wx.config接口进行接口使用申请。

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA的web app可在每次url变化时进行调用,目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题在Android6.2中修复）。

	wx.config({
	    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	    appId: '', // 必填，公众号的唯一标识
	    timestamp: , // 必填，生成签名的时间戳
	    nonceStr: '', // 必填，生成签名的随机串
	    signature: '',// 必填，签名，见附录1
	    jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});

### 步骤四：通过ready接口处理成功验证 ###

	wx.ready(function(){

	    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
	});

### 步骤五：通过error接口处理失败验证 ###

	wx.error(function(res){

	    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
	
	});

