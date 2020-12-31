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
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data:{
          customerId:wx.getStorageSync('customerId')
        },
        method: "POST",
        success(result){
          console.log(result)
        }
      })
    })
  }
})