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

  baseUrl:'https://openapi.keruyun.com',//正式环境
  // baseUrl:'https://gldopenapi.keruyun.com',//测试环境
  appKey:"765f3ea41cb8aaf49956105fb1297177",//appKey
  shopIdenty:"810983262",//门店id
  version:"1.0",//版本号
  token:"356f5be13d589e1f3ac5621b5f57f4c8",//token

  async getSign(){//获取签名
    const that = this
    return await wx.cloud.callFunction({
      name:"sign",
      data:{
        appKey:that.appKey,
        shopIdenty:that.shopIdenty,
        version:that.version,
        token:that.token,
      }
    })
  },
  getPublicKeys(timerstap){//获取公共参数
    return `?appKey=${this.appKey}&shopIdenty=${this.shopIdenty}&version=${this.version}&timestamp=${timerstap}`
  },
  navigator(url){
    wx.navigateTo({
      url
    })
  }
})
