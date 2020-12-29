//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  async getSign(){//获取签名
    return await wx.cloud.callFunction({
      name:"sign",
      data:{
        appKey:"765f3ea41cb8aaf49956105fb1297177",
        shopIdenty:"810094162",
        version:"1.0",
        token:"f7edd59138de401fcf11db116a21a1b6",
      }
    })
  },
  getPublicKeys(){
    return `?appKey=${this.appKey}&shopIdenty=${this.shopIdenty}&version=${this.version}&timestamp=${(new Date()).valueOf()}`
  },
  baseUrl:'https://openapi.keruyun.com',//正式环境
  // baseUrl:'https://gldopenapi.keruyun.com',//测试环境
  appKey:"765f3ea41cb8aaf49956105fb1297177",
  shopIdenty:"810094162",
  version:"1.0",
})
