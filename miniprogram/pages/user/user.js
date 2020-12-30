const app = getApp()
Page({
  data: {
    mobile:wx.getStorageSync('mobile'),
    avatar:wx.getStorageSync('avatar'),
    name:wx.getStorageSync('name'),
  },

  onLoad: function (options) {
    this.getUserInfo()
  },
  getUserInfo(){
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys() + `&sign=${res.result}`,
        header: {
          "Content-Type": "application/json"
        },
        data:{
          customerId:wx.getStorageSync('customerId'),
          "isNeedCredit": 1
        },
        method: "POST",
        success(result){
          console.log(result)
        }
      })
    })
  }
})