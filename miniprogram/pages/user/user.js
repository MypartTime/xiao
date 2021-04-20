const app = getApp()
Page({
  data: {
    mobile: wx.getStorageSync('mobile'),
    avatar: wx.getStorageSync('avatar'),
    customerId: wx.getStorageSync('customerId'),
    name: "",
    userInfo: {},
    time: new Date().getHours()
  },

  onShow: function () {
    if (wx.getStorageSync('customerId')) {
      this.getUserInfo()
    }
    this.setData({
      mobile: wx.getStorageSync('mobile'),
      avatar: wx.getStorageSync('avatar'),
      customerId: wx.getStorageSync('customerId'),
    })
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.getUserInfo()
  },
  getUserInfo() {
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
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result,
              name: result.data.result.customerName
            })
          }
        }
      })
    })
  },
  handleRouter(e) {
    let i = e.currentTarget.dataset.i
    if (wx.getStorageSync('customerId')) {
      switch (i) {
        case '1':
          app.navigator('/pages/userinfo/userinfo');
          break;
        case '2':
          app.navigator('/pages/purse/purse');
          break;
        case '3':
          app.navigator('/pages/ticket/ticket');
          break;
        case '4':
          app.navigator('/pages/recharge/recharge');
          break;
        case '5':
          if (this.data.userInfo.level) {
            app.navigator('/pages/changePwd/changePwd');
          } else {
            app.showToast('充值会员即可设置支付密码', 'none')
          }
          break;
        case '6':
          app.navigator('/pages/address/address');
          break;
        case '7':
          app.navigator('/pages/integral/integral');
          break;
      }
    } else {
      app.showToast('请先登录', 'error')
    }
  }
})