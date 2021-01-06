const app = getApp()
Page({
  data: {
    userInfo: {},
    show:false
  },
  onShow() {
    this.getUserInfo()
  },
  getUserInfo() {
    app.showLoading('加载中')
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          customerId: wx.getStorageSync('customerId')
        },
        method: "POST",
        success(result) {
          app.hideLoading()
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result,
              show:true
            })
          }else{
            that.setData({
              show:true
            })
            wx.showModal({
              title:'提示',
              content:result.data.message,
              showCancel:false
            })
          }
        }
      })
    })
  },
  handleRouter(e) {
    let i = e.currentTarget.dataset.i
    switch (i) {
      case '1':
        app.navigator('/pages/recharge/recharge');
        break;
      case '2':
        app.navigator('/pages/record/record');
        break;
      case '3':
        app.navigator('/pages/recharge/recharge');
        break;
      case '4':
        wx.navigateBack({
          delta: 1,
        })
        break;
    }
  }
})