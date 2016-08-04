# 基于koa的微信JS-SDK通用授权服务器 #

本项目为微信JS-SDK通用服务器，实现了微信公众号服务器接入的通用逻辑，比如服务器验证等。

有需要自己搭建微信公众号后台的同学，可以直接下载本项目代码即可轻松接入。

本代码基于nodejs koa框架实现，里面用到了ES6，还没接触过ES6的同学最好先看下ES6的规范。

服务器依赖：

- Redis：微信授权token等凭证的缓存

服务器文档如下：

- [接口协议](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%8D%8F%E8%AE%AE.md)
- [接口列表](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E6%8E%A5%E5%8F%A3%E5%88%97%E8%A1%A8/readme.md)
- [概要设计](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/readme.md)

