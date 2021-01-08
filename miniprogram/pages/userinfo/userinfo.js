const app = getApp()
Page({
  data: {
    avatar:'',
    userInfo:{}
  },
  onLoad(){
    this.getUserInfo()
    this.setData({
      avatar:wx.getStorageSync('avatar')
    })
  },
  getUserInfo(){
    const that = this
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
          if(result.data.code == 0){
            that.setData({
              userInfo:result.data.result
            })
          }
        }
      })
    })
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