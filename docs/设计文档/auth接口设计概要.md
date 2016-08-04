# auth接口设计 #

## 一、什么是OAuth2.0 ##

官方网站：

- [http://oauth.net/](http://oauth.net/) 
- [http://oauth.net/2/](http://oauth.net/2/)

权威定义：OAuth is An open protocol to allow secure authorization in a simple and standard method from web, mobile and desktop applications. 

OAuth是一个开放协议，允许用户让第三方应用以安全且标准的方式获取该用户在某一网站、移动或桌面应用上存储的私密的资源（如用户个人信息、照片、视频、联系人列表），而无需将用户名和密码提供给第三方应用。

OAuth 2.0是OAuth协议的下一版本，但不向后兼容OAuth 1.0。 OAuth 2.0关注客户端开发者的简易性，同时为Web应用，桌面应用和手机，和起居室设备提供专门的认证流程。

OAuth允许用户提供一个令牌，而不是用户名和密码来访问他们存放在特定服务提供者的数据。每一个令牌授权一个特定的网站（例如，视频编辑网站)在特定的时段（例如，接下来的2小时内）内访问特定的资源（例如仅仅是某一相册中的视频）。这样，OAuth允许用户授权第三方网站访问他们存储在另外的服务提供者上的信息，而不需要分享他们的访问许可或他们数据的所有内容。

新浪微博API目前也使用OAuth 2.0。

### 微信Oauth2.0授权协议，整体流程 ###
![](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/%E5%BE%AE%E4%BF%A1OAuth2.0%E6%8E%88%E6%9D%83%E5%8D%8F%E8%AE%AE-%E6%95%B4%E4%BD%93%E6%B5%81%E7%A8%8B.png?raw=true)

## 二、微信公众平台OAuth2.0授权 ##

微信公众平台OAuth2.0授权详细步骤如下：

1. 用户关注微信公众账号
2. 微信公众账号提供用户请求授权页面URL
3. 用户点击授权页面URL，将向服务器发起请求
4. 服务器询问用户是否同意授权给微信公众账号(scope为snsapi_base时无此步骤)
5. 用户同意(scope为snsapi_base时无此步骤)
6. 服务器将CODE通过回调传给微信公众账号
7. 微信公众账号获得CODE
8. 微信公众账号通过CODE向服务器请求Access Token
9. 服务器返回Access Token和OpenID给微信公众账号
10. 微信公众账号通过Access Token向服务器请求用户信息(scope为snsapi_base时无此步骤)
11. 服务器将用户信息回送给微信公众账号(scope为snsapi_base时无此步骤)

如果用户在微信中（Web微信除外）访问公众号的第三方网页，公众号开发者可以通过此接口获取当前用户基本信息（包括昵称、性别、城市、国家）。利用用户信息，可以实现体验优化、用户来源统计、帐号绑定、用户身份鉴权等功能。

**请注意，“获取用户基本信息接口是在用户和公众号产生消息交互时，才能根据用户OpenID获取用户基本信息，而网页授权的方式获取用户基本信息，则无需消息交互，只是用户进入到公众号的网页，就可弹出请求用户授权的界面，用户授权后，就可获得其基本信息（此过程甚至不需要用户已经关注公众号。）”**

在微信公众号请求用户网页授权之前，开发者需要先到公众平台网站的我的服务页中配置授权回调域名。请注意，这里填写的域名不要加`http://`

![](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/%E7%BD%91%E9%A1%B5%E6%8E%88%E6%9D%83%E5%9B%9E%E8%B0%83%E5%9F%9F%E5%90%8D.png?raw=true)
