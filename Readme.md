# 基于 koa 的微信 JS-SDK 通用授权服务器 #

本项目为微信 [JS-SDK](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432) 通用服务器，实现了微信公众号服务器接入的通用逻辑，比如服务器验证等。

有需要自己搭建微信公众号后台的同学，可以直接下载本项目代码即可轻松接入。

本代码基于 nodejs [koa](https://koa.bootcss.com/) 框架实现，里面用到了 ES6，还没接触过ES6的同学最好先看下 [ES6](http://es6.ruanyifeng.com/) 的规范。

服务器依赖：

- Redis：微信授权 token 等凭证的缓存

服务器文档如下：

- [接口协议](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%8D%8F%E8%AE%AE.md)
- [接口列表](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%88%97%E8%A1%A8/readme.md)
- [概要设计](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/readme.md)

## 接口列表

- [公众号服务器认证接口](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%88%97%E8%A1%A8/00_%E5%85%AC%E4%BC%97%E5%8F%B7%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%AE%A4%E8%AF%81%E6%8E%A5%E5%8F%A3.md)
- [JS-SDK 注入权限配置信息接口](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%88%97%E8%A1%A8/01_JS-SDK%E6%B3%A8%E5%85%A5%E6%9D%83%E9%99%90%E9%85%8D%E7%BD%AE%E4%BF%A1%E6%81%AF%E6%8E%A5%E5%8F%A3.md)
- [网页授权获取用户基本信息接口](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%88%97%E8%A1%A8/02_%E7%BD%91%E9%A1%B5%E6%8E%88%E6%9D%83%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E5%9F%BA%E6%9C%AC%E4%BF%A1%E6%81%AF%E6%8E%A5%E5%8F%A3.md)

## 部署文档

1. 下载代码

```bash
git clone https://github.com/diamont1001/wechat-jssdk-server.git
cd wechat-jssdk-server
```

2. 修改配置文件

本系统使用了 `redis` 作数据缓存，用来保存 session 等临时信息，所以在启动之前需要先配备一个 `redis`，OK 了后，修改本系统的配置信息以连接正确的 `redis`。

配置文件在：`conf/config.json`，其中 `redis` 字段里的配置信息配置上去即可。

另外，还有一个配置，就是配置微信公众号平台的信息，对应于系统配置项的 `wechat` 项。

3. 安装依赖，运行

```bash
npm i
npm start
```

### 测试页面

系统成功运行后，`/test/wx/*` 路径下有提供了测试页面。
