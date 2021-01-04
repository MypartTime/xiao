const app = getApp()
Page({
  data: {

  },
  onLoad(){
    this.setUserInfo()
  },
  setUserInfo(){
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/updateCustomerInfo' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        method:"POST",
        data:{
          birthday:new Date().getTime(),
          consumePwd:"123456",
          customerId:wx.getStorageSync('customerId'),
          name:"陈冠希",
          sex:1
        },
        success(result){
          console.log(result)
        }
      })
    })
  }
})