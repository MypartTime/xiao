const app = getApp()
Page({
  data: {
    mobile:wx.getStorageSync('mobile'),
    avatar:wx.getStorageSync('avatar'),
    customerId:wx.getStorageSync('customerId'),
    name:"",
    userInfo:{},
    time:new Date().getHours()
  },

  onShow: function (options) {
    if(wx.getStorageSync('customerId')){
      this.getUserInfo()
    }
    this.setData({
      mobile:wx.getStorageSync('mobile'),
      avatar:wx.getStorageSync('avatar'),
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
              userInfo:result.data.result,
              name:result.data.result.customerName
            })
          }
        }
      })
    })
  },
  handleRouter(e){
    let i = e.currentTarget.dataset.i
    if(wx.getStorageSync('customerId')){
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
          if(this.data.userInfo.level){
  
          }else{
            app.showToast('充值会员即可设置支付密码','none')
          }
          break; 
      }
    }else{
      app.showToast('请先登录','error')
    }
  }
})