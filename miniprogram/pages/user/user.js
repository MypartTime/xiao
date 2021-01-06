const app = getApp()
Page({
  data: {
    mobile:wx.getStorageSync('mobile'),
    avatar:wx.getStorageSync('avatar'),
    name:wx.getStorageSync('name'),
    userInfo:{},
    time:new Date().getHours()
  },

  onLoad: function (options) {
    this.getUserInfo()
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
  handleRouter(e){
    let i = e.currentTarget.dataset.i
    console.log(i)
    switch(i){
      case '1':
        app.navigator('/pages/userinfo/userinfo');
        break;
      case '2':
        app.navigator('/pages/purse/purse');
        break;
      case '3':
        app.navigator('/pages/recharge/recharge');
        break;
      case '4':
        app.navigator('/pages/recharge/recharge');
        break;
      
    }
  }
})