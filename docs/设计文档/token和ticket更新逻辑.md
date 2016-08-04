# token和ticket更新逻辑 #

【[参考JS-SDK说明文档](http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html)】

access_token是公众号的全局唯一票据，公众号调用各接口时都需使用 `access_token`。开发者需要进行妥善保存。`access_token` 的存储至少要保留512个字符空间。`access_token` 的有效期目前为2个小时，需定时刷新，重复获取将导致上次获取的 `access_token` 失效。

所以，`access_token` 不能每次请求都直接去微信服务器请求，而是本地服务器去微信获取  `access_token` 后缓存在本地redis，缓存时间为2小时（由微信接口返回），然后本地服务器每1分钟轮询一次检查 `access_token` 有效期，发现有效期小于8分钟则重新去获取并更新。

整个 `access_token` 的更新动作都是跟用户接口请求分离开的，是服务器自有的动作，接口请求直接从redis拿，拿不到就返回空。

【[参考JS-SDK说明文档](http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html)】

`api_ticket` 是用于调用微信卡券JS API的临时票据，有效期为7200 秒，通过 `access_token` 来获取。

开发者注意事项：

1. 此用于卡券接口签名的 `api_ticket `与步骤三中[通过config接口注入权限验证配置](http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E6.AD.A5.E9.AA.A4.E4.B8.89.EF.BC.9A.E9.80.9A.E8.BF.87config.E6.8E.A5.E5.8F.A3.E6.B3.A8.E5.85.A5.E6.9D.83.E9.99.90.E9.AA.8C.E8.AF.81.E9.85.8D.E7.BD.AE)使用的jsapi_ticket不同
2. 由于获取 `api_ticket` 的api 调用次数非常有限，频繁刷新 `api_ticket` 会导致api调用受限，影响自身业务，开发者需在自己的服务存储与更新api_ticket
3. `api_ticket` 的更新逻辑跟 `access_token`一样，是在更新完 `access_token ` 后接着就去更新api_ticket

## 流程图 ##

因为服务器是分布式部署的，难免会遇到两台机器或者多台机器同时更新 `access_token` 的情况（虽然这机率很小很小很小），这样就有可能会导致冲突情况发生，最后保存在redis里的 `access_token` 有可能不是最新的（至于为什么，自己脑补）。

所以，这里引入了redis lock，在需要更新之前先去申请redis锁，申请成功则继续进行更新操作，申请锁不成功则认为是已经有其他服务器在进行更新操作了，本机就可以不进行更新操作而直接返回等待下次轮询。

其中，redis lock使用了nodejs的库：【[node-redlock](https://github.com/mike-marcacci/node-redlock)】

![](https://github.com/diamont1001/wechat-jssdk-server/blob/master/docs/%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3/token%E5%92%8Cticket%E6%9B%B4%E6%96%B0%E9%80%BB%E8%BE%91.png?raw=true)

